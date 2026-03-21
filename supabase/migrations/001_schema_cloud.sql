-- =============================================================================
-- EHSS Tracker - Database Schema (Supabase Cloud Compatible)
-- Migration 001: Core tables, indexes, and trigger functions
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES - extends Supabase auth.users
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
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

-- ---------------------------------------------------------------------------
-- 2. PROJECTS
-- ---------------------------------------------------------------------------
CREATE TABLE projects (
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

-- ---------------------------------------------------------------------------
-- 3. PROJECT_MEMBERS
-- ---------------------------------------------------------------------------
CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin','pm','inspector','viewer')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 4. PREMOB_CHECKLIST
-- ---------------------------------------------------------------------------
CREATE TABLE premob_checklist (
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

-- ---------------------------------------------------------------------------
-- 5. MOB_CHECKLIST
-- ---------------------------------------------------------------------------
CREATE TABLE mob_checklist (
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

-- ---------------------------------------------------------------------------
-- 6. DEMOB_CHECKLIST
-- ---------------------------------------------------------------------------
CREATE TABLE demob_checklist (
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

-- ---------------------------------------------------------------------------
-- 7. KPI_DATA
-- ---------------------------------------------------------------------------
CREATE TABLE kpi_data (
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

-- ---------------------------------------------------------------------------
-- 8. INSPECTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE inspections (
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

-- ---------------------------------------------------------------------------
-- 9. TRAINING_RECORDS
-- ---------------------------------------------------------------------------
CREATE TABLE training_records (
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

-- ---------------------------------------------------------------------------
-- 10. EQUIPMENT
-- ---------------------------------------------------------------------------
CREATE TABLE equipment (
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

-- ---------------------------------------------------------------------------
-- 11. INCIDENTS
-- ---------------------------------------------------------------------------
CREATE TABLE incidents (
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

-- ---------------------------------------------------------------------------
-- 12. SUBCONTRACTORS
-- ---------------------------------------------------------------------------
CREATE TABLE subcontractors (
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

-- ---------------------------------------------------------------------------
-- 13. MANPOWER_MONTHLY
-- ---------------------------------------------------------------------------
CREATE TABLE manpower_monthly (
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

-- ---------------------------------------------------------------------------
-- 14. DOCUMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE documents (
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

-- ---------------------------------------------------------------------------
-- 15. AUDIT_LOG
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
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


-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_premob_checklist_project_id ON premob_checklist(project_id);
CREATE INDEX idx_premob_checklist_section ON premob_checklist(section);
CREATE INDEX idx_premob_checklist_completed ON premob_checklist(completed);
CREATE INDEX idx_mob_checklist_project_id ON mob_checklist(project_id);
CREATE INDEX idx_mob_checklist_section ON mob_checklist(section);
CREATE INDEX idx_mob_checklist_completed ON mob_checklist(completed);
CREATE INDEX idx_demob_checklist_project_id ON demob_checklist(project_id);
CREATE INDEX idx_demob_checklist_section ON demob_checklist(section);
CREATE INDEX idx_demob_checklist_completed ON demob_checklist(completed);
CREATE INDEX idx_demob_checklist_priority ON demob_checklist(priority);
CREATE INDEX idx_kpi_data_project_id ON kpi_data(project_id);
CREATE INDEX idx_kpi_data_kpi_code ON kpi_data(kpi_code);
CREATE INDEX idx_kpi_data_year_month ON kpi_data(year, month);
CREATE INDEX idx_inspections_project_id ON inspections(project_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created_by ON inspections(created_by);
CREATE INDEX idx_training_records_project_id ON training_records(project_id);
CREATE INDEX idx_training_records_status ON training_records(status);
CREATE INDEX idx_training_records_card_expiry ON training_records(card_expiry);
CREATE INDEX idx_training_records_created_by ON training_records(created_by);
CREATE INDEX idx_equipment_project_id ON equipment(project_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_cert_expiry ON equipment(cert_expiry);
CREATE INDEX idx_equipment_created_by ON equipment(created_by);
CREATE INDEX idx_incidents_project_id ON incidents(project_id);
CREATE INDEX idx_incidents_date ON incidents(incident_date);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_by ON incidents(created_by);
CREATE INDEX idx_subcontractors_project_id ON subcontractors(project_id);
CREATE INDEX idx_subcontractors_year_quarter ON subcontractors(year, quarter);
CREATE INDEX idx_subcontractors_rag_status ON subcontractors(rag_status);
CREATE INDEX idx_manpower_monthly_project_id ON manpower_monthly(project_id);
CREATE INDEX idx_manpower_monthly_year_month ON manpower_monthly(year, month);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_doc_type ON documents(doc_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);


-- =============================================================================
-- TRIGGER: auto-update updated_at columns
-- =============================================================================
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


-- =============================================================================
-- TRIGGER: auto-create profile when a new user signs up
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
