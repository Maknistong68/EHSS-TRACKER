-- =============================================================================
-- EHSS Tracker - Database Schema
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

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.role IS 'Global application role';
COMMENT ON COLUMN profiles.consent_given IS 'PDPL data-processing consent flag';

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

COMMENT ON TABLE projects IS 'Top-level project entity';

-- ---------------------------------------------------------------------------
-- 3. PROJECT_MEMBERS - many-to-many users <-> projects
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

COMMENT ON TABLE project_members IS 'Project-level role assignments';

-- ---------------------------------------------------------------------------
-- 4. PREMOB_CHECKLIST - 64 pre-mobilization items
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

COMMENT ON TABLE premob_checklist IS '64-item pre-mobilization checklist per project';

-- ---------------------------------------------------------------------------
-- 5. MOB_CHECKLIST - 48 mobilization items
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

COMMENT ON TABLE mob_checklist IS '48-item mobilization checklist per project';

-- ---------------------------------------------------------------------------
-- 6. DEMOB_CHECKLIST - 35 demobilization items (with priority)
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

COMMENT ON TABLE demob_checklist IS '35-item demobilization checklist per project';

-- ---------------------------------------------------------------------------
-- 7. KPI_DATA - monthly KPI values
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

COMMENT ON TABLE kpi_data IS 'Monthly KPI metric values per project';

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

COMMENT ON TABLE inspections IS 'Site inspection records';

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

COMMENT ON TABLE training_records IS 'Employee training and induction records';

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

COMMENT ON TABLE equipment IS 'Plant and equipment register';

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

COMMENT ON TABLE incidents IS 'Incident and accident records';

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

COMMENT ON TABLE subcontractors IS 'Quarterly subcontractor HSSE performance';

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

COMMENT ON TABLE manpower_monthly IS 'Monthly manpower and manhour statistics';

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

COMMENT ON TABLE documents IS 'Project documents, permits, certificates';

-- ---------------------------------------------------------------------------
-- 15. AUDIT_LOG - PDPL compliance trail
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

COMMENT ON TABLE audit_log IS 'Immutable audit trail for PDPL compliance';


-- =============================================================================
-- INDEXES
-- =============================================================================

-- profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- project_members
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- premob_checklist
CREATE INDEX idx_premob_checklist_project_id ON premob_checklist(project_id);
CREATE INDEX idx_premob_checklist_section ON premob_checklist(section);
CREATE INDEX idx_premob_checklist_completed ON premob_checklist(completed);

-- mob_checklist
CREATE INDEX idx_mob_checklist_project_id ON mob_checklist(project_id);
CREATE INDEX idx_mob_checklist_section ON mob_checklist(section);
CREATE INDEX idx_mob_checklist_completed ON mob_checklist(completed);

-- demob_checklist
CREATE INDEX idx_demob_checklist_project_id ON demob_checklist(project_id);
CREATE INDEX idx_demob_checklist_section ON demob_checklist(section);
CREATE INDEX idx_demob_checklist_completed ON demob_checklist(completed);
CREATE INDEX idx_demob_checklist_priority ON demob_checklist(priority);

-- kpi_data
CREATE INDEX idx_kpi_data_project_id ON kpi_data(project_id);
CREATE INDEX idx_kpi_data_kpi_code ON kpi_data(kpi_code);
CREATE INDEX idx_kpi_data_year_month ON kpi_data(year, month);

-- inspections
CREATE INDEX idx_inspections_project_id ON inspections(project_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created_by ON inspections(created_by);

-- training_records
CREATE INDEX idx_training_records_project_id ON training_records(project_id);
CREATE INDEX idx_training_records_status ON training_records(status);
CREATE INDEX idx_training_records_card_expiry ON training_records(card_expiry);
CREATE INDEX idx_training_records_created_by ON training_records(created_by);

-- equipment
CREATE INDEX idx_equipment_project_id ON equipment(project_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_cert_expiry ON equipment(cert_expiry);
CREATE INDEX idx_equipment_created_by ON equipment(created_by);

-- incidents
CREATE INDEX idx_incidents_project_id ON incidents(project_id);
CREATE INDEX idx_incidents_date ON incidents(incident_date);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_by ON incidents(created_by);

-- subcontractors
CREATE INDEX idx_subcontractors_project_id ON subcontractors(project_id);
CREATE INDEX idx_subcontractors_year_quarter ON subcontractors(year, quarter);
CREATE INDEX idx_subcontractors_rag_status ON subcontractors(rag_status);

-- manpower_monthly
CREATE INDEX idx_manpower_monthly_project_id ON manpower_monthly(project_id);
CREATE INDEX idx_manpower_monthly_year_month ON manpower_monthly(year, month);

-- documents
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_doc_type ON documents(doc_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_created_by ON documents(created_by);

-- audit_log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);


-- =============================================================================
-- TRIGGER FUNCTION: auto-update updated_at columns
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column()
  IS 'Automatically sets updated_at to current timestamp on row update';

-- Apply the trigger to every table that has an updated_at column
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
-- TRIGGER FUNCTION: auto-create profile on auth.users insert
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user()
  IS 'Creates a profile row automatically when a new auth user signs up';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
