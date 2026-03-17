# Oracle Cloud Jeddah Setup Guide

## Overview

This guide covers deploying the self-hosted Supabase instance on Oracle Cloud Infrastructure (OCI) Always Free tier in the **Jeddah, Saudi Arabia (me-jeddah-1)** region. This ensures full Saudi PDPL compliance by keeping all personal data within KSA borders.

## Prerequisites

- Oracle Cloud account (Always Free tier)
- SSH key pair for VM access
- Domain name (for HTTPS)

## Step 1: Create OCI Account

1. Go to https://cloud.oracle.com
2. Sign up for an Always Free account
3. Select **Home Region: Saudi Arabia West (Jeddah)** - `me-jeddah-1`
4. Complete identity verification

## Step 2: Create ARM VM Instance

Oracle Always Free includes an ARM-based VM with:
- **4 OCPU** (Ampere A1 processor)
- **24 GB RAM**
- **200 GB boot volume**

### Create the instance:

1. Navigate to **Compute > Instances > Create Instance**
2. Configuration:
   - **Name**: `ehss-supabase`
   - **Placement**: AD-1 (Jeddah)
   - **Image**: Ubuntu 22.04 (aarch64)
   - **Shape**: VM.Standard.A1.Flex
     - OCPU: 4
     - RAM: 24 GB
   - **Boot volume**: 200 GB
3. Add your SSH public key
4. Create the instance

## Step 3: Configure Networking

### Security List (Firewall Rules):

Add ingress rules for:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP (redirect) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 8000 | TCP | 0.0.0.0/0 | Supabase API |

### Reserve Public IP:
1. Go to **Networking > IP Management > Reserved Public IPs**
2. Reserve a public IP and attach to the instance

## Step 4: Set Up the Server

SSH into the instance:

```bash
ssh ubuntu@<your-public-ip>
```

### Install Docker:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
# Log out and back in
```

### Install Nginx (reverse proxy):

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Install Supabase:

```bash
mkdir -p ~/ehss-supabase
cd ~/ehss-supabase

# Copy docker-compose.yml and .env.supabase from this repo
# Edit .env.supabase with your actual secrets
```

## Step 5: Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate Postgres password
openssl rand -base64 24

# Generate API keys using the Supabase JWT tool
# Visit: https://supabase.com/docs/guides/self-hosting#api-keys
# Use your JWT secret to generate ANON_KEY and SERVICE_ROLE_KEY
```

## Step 6: Configure Nginx

Create `/etc/nginx/sites-available/supabase`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL will be configured by certbot

    # Supabase API
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (for Realtime)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and get SSL:

```bash
sudo ln -s /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d api.yourdomain.com
sudo systemctl restart nginx
```

## Step 7: Start Supabase

```bash
cd ~/ehss-supabase
docker compose up -d
```

## Step 8: Initialize Database

```bash
# Connect to PostgreSQL
docker exec -it ehss-db psql -U postgres -d ehss

# Run the migration files
\i /path/to/001_schema.sql
\i /path/to/002_rls_policies.sql
\i /path/to/003_seed_data.sql
```

Or copy the SQL files into the container:

```bash
docker cp 001_schema.sql ehss-db:/tmp/
docker cp 002_rls_policies.sql ehss-db:/tmp/
docker cp 003_seed_data.sql ehss-db:/tmp/

docker exec ehss-db psql -U postgres -d ehss -f /tmp/001_schema.sql
docker exec ehss-db psql -U postgres -d ehss -f /tmp/002_rls_policies.sql
docker exec ehss-db psql -U postgres -d ehss -f /tmp/003_seed_data.sql
```

## Step 9: Deploy Frontend to Vercel

1. Push your code to GitHub
2. Connect to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://api.yourdomain.com`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Deploy

## Step 10: Verify

1. Visit your Vercel URL
2. Register a new account
3. Create a project
4. Verify all 13 modules work correctly

## Maintenance

### Backups:

```bash
# Daily PostgreSQL backup
docker exec ehss-db pg_dump -U postgres ehss > backup_$(date +%Y%m%d).sql

# Add to crontab for automatic daily backups
0 2 * * * docker exec ehss-db pg_dump -U postgres ehss > /home/ubuntu/backups/ehss_$(date +\%Y\%m\%d).sql
```

### Updates:

```bash
cd ~/ehss-supabase
docker compose pull
docker compose up -d
```

### Monitoring:

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Check disk usage
df -h
```

## PDPL Compliance Checklist

- [x] All data stored in Jeddah, Saudi Arabia (me-jeddah-1)
- [x] Encryption at rest (PostgreSQL)
- [x] Encryption in transit (TLS 1.3 via Nginx/Let's Encrypt)
- [x] User consent tracking on registration
- [x] Audit log for all data modifications
- [x] Role-based access control
- [x] Row Level Security on all tables
- [x] Data deletion capability (right to erasure)
- [x] No cross-border data transfer (frontend is static only)
