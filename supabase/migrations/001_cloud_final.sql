-- =============================================================================
-- EHSS Tracker - Schema (Supabase Cloud) - NO auth schema access needed
-- =============================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('owner','admin','pm','inspector','viewer')),
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contract_no TEXT,
  location    TEXT,
  region      TEXT,
  start_year  INTEGER NOT NULL DEFAULT 2024,
  status      TEXT DEFAULT 'active'
                CHECK (status IN ('active','completed','suspended')),
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECT_MEMBERS
CREATE TABLE IF NOT EXISTS project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin','pm','inspector','viewer')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 4. PREMOB_CHECKLIST
CREATE TABLE IF NOT EXISTS premob_checklist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section       TEXT NOT NULL,
  item_number   INTEGER NOT NULL,
  description   TEXT NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  completed_by  UUID REFERENCES profiles(id),
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MOB_CHECKLIST
CREATE TABLE IF NOT EXISTS mob_checklist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section       TEXT NOT NULL,
  item_number   INTEGER NOT NULL,
  description   TEXT NOT NULL,
  completed     BOOLEAN DEFAULT FALSE,
  completed_by  UUID REFERENCES profiles(id),
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DEMOB_CHECKLIST
CREATE TABLE IF NOT EXISTS demob_checklist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section       TEXT NOT NULL,
  item_number   INTEGER NOT NULL,
  description   TEXT NOT NULL,
  priority      TEXT DEFAULT 'MEDIUM'
                  CHECK (priority IN ('HIGH','MEDIUM','LOW')),
  completed     BOOLEAN DEFAULT FALSE,
  completed_by  UUID REFERENCES profiles(id),
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KPI_DATA
CREATE TABLE IF NOT EXISTS kpi_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kpi_code    TEXT NOT NULL,
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  value       NUMERIC,
  target      NUMERIC,
  rag_status  TEXT CHECK (rag_status IN ('green','amber','red')),
  updated_by  UUID REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, kpi_code, year, month)
);

-- 8. INSPECTIONS
CREATE TABLE IF NOT EXISTS inspections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  type            TEXT NOT NULL,
  location        TEXT,
  inspector       TEXT NOT NULL,
  findings        TEXT,
  ncr_count       INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'Open'
                    CHECK (status IN ('Open','Closed','In Progress')),
  verified        BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES profiles(id),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TRAINING_RECORDS
CREATE TABLE IF NOT EXISTS training_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,
  employee_id     TEXT,
  role            TEXT,
  company         TEXT,
  induction_date  DATE,
  card_expiry     DATE,
  training_type   TEXT,
  status          TEXT DEFAULT 'Valid'
                    CHECK (status IN ('Valid','Expiring','Expired')),
  verified        BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES profiles(id),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EQUIPMENT
CREATE TABLE IF NOT EXISTS equipment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  equipment_id    TEXT,
  serial_number   TEXT,
  swl             TEXT,
  cert_expiry     DATE,
  status          TEXT DEFAULT 'Valid'
                    CHECK (status IN ('Valid','Expiring','Expired')),
  condition       TEXT DEFAULT 'Good'
                    CHECK (condition IN ('Good','Fair','Poor','Out of Service')),
  verified        BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES profiles(id),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  incident_date         DATE NOT NULL,
  severity              TEXT NOT NULL
                          CHECK (severity IN ('Near-Miss','First Aid','MTI','LTI','Fatality')),
  description           TEXT NOT NULL,
  location              TEXT,
  investigation_status  TEXT DEFAULT 'Pending'
                          CHECK (investigation_status IN ('Pending','In Progress','Completed')),
  capa_status           TEXT DEFAULT 'Open'
                          CHECK (capa_status IN ('Open','In Progress','Closed')),
  verified              BOOLEAN DEFAULT FALSE,
  verified_by           UUID REFERENCES profiles(id),
  created_by            UUID REFERENCES profiles(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SUBCONTRACTORS
CREATE TABLE IF NOT EXISTS subcontractors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  trade               TEXT,
  year                INTEGER NOT NULL,
  quarter             INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  workers             INTEGER DEFAULT 0,
  induction_pct       NUMERIC DEFAULT 0,
  training_pct        NUMERIC DEFAULT 0,
  audit_score_pct     NUMERIC DEFAULT 0,
  ptw_compliance_pct  NUMERIC DEFAULT 0,
  overall_score       NUMERIC DEFAULT 0,
  rag_status          TEXT CHECK (rag_status IN ('green','amber','red')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MANPOWER_MONTHLY
CREATE TABLE IF NOT EXISTS manpower_monthly (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  headcount       INTEGER DEFAULT 0,
  manhours        NUMERIC DEFAULT 0,
  ot_hours        NUMERIC DEFAULT 0,
  ot_percentage   NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, year, month)
);

-- 14. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL,
  name        TEXT NOT NULL,
  holder      TEXT,
  issue_date  DATE,
  expiry_date DATE,
  status      TEXT DEFAULT 'Valid'
                CHECK (status IN ('Valid','Expiring','Expired')),
  flag        TEXT DEFAULT 'None'
                CHECK (flag IN ('None','Warning','Critical')),
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT_LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_premob_checklist_project_id ON premob_checklist(project_id);
CREATE INDEX IF NOT EXISTS idx_mob_checklist_project_id ON mob_checklist(project_id);
CREATE INDEX IF NOT EXISTS idx_demob_checklist_project_id ON demob_checklist(project_id);
CREATE INDEX IF NOT EXISTS idx_kpi_data_project_id ON kpi_data(project_id);
CREATE INDEX IF NOT EXISTS idx_kpi_data_kpi_code ON kpi_data(kpi_code);
CREATE INDEX IF NOT EXISTS idx_inspections_project_id ON inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_training_records_project_id ON training_records(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_project_id ON equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_incidents_project_id ON incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_project_id ON subcontractors(project_id);
CREATE INDEX IF NOT EXISTS idx_manpower_monthly_project_id ON manpower_monthly(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- TRIGGER: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_kpi_data_updated_at
  BEFORE UPDATE ON kpi_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
