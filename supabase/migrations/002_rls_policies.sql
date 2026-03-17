-- =============================================================================
-- EHSS Tracker - Row Level Security Policies
-- Migration 002: RLS policies for all tables
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTION: resolve a user's effective role for a given project
-- Returns 'owner' if the user holds the global owner role in profiles,
-- otherwise returns the project_members.role value, or NULL if not a member.
-- =============================================================================
CREATE OR REPLACE FUNCTION auth.user_project_role(p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_global_role TEXT;
  v_project_role TEXT;
BEGIN
  -- Check the global profile role first
  SELECT role INTO v_global_role
    FROM profiles
   WHERE id = auth.uid();

  -- Global owner sees everything
  IF v_global_role = 'owner' THEN
    RETURN 'owner';
  END IF;

  -- Global admin also gets elevated access
  IF v_global_role = 'admin' THEN
    RETURN 'admin';
  END IF;

  -- Otherwise fall back to project-level membership
  SELECT pm.role INTO v_project_role
    FROM project_members pm
   WHERE pm.project_id = p_project_id
     AND pm.user_id = auth.uid();

  RETURN v_project_role;  -- NULL when not a member
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.user_project_role(UUID)
  IS 'Returns the effective role of the current user for a given project';


-- =============================================================================
-- HELPER: boolean shorthand - is user a member of the project?
-- =============================================================================
CREATE OR REPLACE FUNCTION auth.is_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_project_role(p_project_id) IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.is_project_member(UUID)
  IS 'Returns TRUE if the current user has any role on the given project';


-- =============================================================================
-- HELPER: can the user write to a given project?
-- owner, admin, pm can always write; inspector has limited write access
-- =============================================================================
CREATE OR REPLACE FUNCTION auth.can_write_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_project_role(p_project_id) IN ('owner','admin','pm');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.can_write_project(UUID)
  IS 'Returns TRUE if the current user can write general data for the project';


-- =============================================================================
-- HELPER: can the inspector-level user write to inspection-related tables?
-- =============================================================================
CREATE OR REPLACE FUNCTION auth.can_inspect_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_project_role(p_project_id) IN ('owner','admin','pm','inspector');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.can_inspect_project(UUID)
  IS 'Returns TRUE if the user can write inspection/incident/training data';


-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE premob_checklist  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mob_checklist     ENABLE ROW LEVEL SECURITY;
ALTER TABLE demob_checklist   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_data          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment         ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE manpower_monthly  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- 1. PROFILES
-- =============================================================================

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

-- Owner/admin can read all profiles
CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
         AND p.role IN ('owner','admin')
    )
  );

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Owner can update any profile (e.g. to change global roles)
CREATE POLICY profiles_update_owner ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'owner'
    )
  );

-- Inserts handled by the handle_new_user trigger (SECURITY DEFINER)
-- No direct insert policy needed for regular users.


-- =============================================================================
-- 2. PROJECTS
-- =============================================================================

-- Users can read projects they belong to
CREATE POLICY projects_select_member ON projects
  FOR SELECT USING (auth.is_project_member(id));

-- Owner/admin can create projects
CREATE POLICY projects_insert_admin ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
         AND p.role IN ('owner','admin')
    )
  );

-- Owner/admin can update any project; PM can update their own projects
CREATE POLICY projects_update ON projects
  FOR UPDATE USING (
    auth.user_project_role(id) IN ('owner','admin','pm')
  );

-- Only owner can delete projects
CREATE POLICY projects_delete_owner ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'owner'
    )
  );


-- =============================================================================
-- 3. PROJECT_MEMBERS
-- =============================================================================

-- Users can see memberships for projects they belong to
CREATE POLICY project_members_select ON project_members
  FOR SELECT USING (auth.is_project_member(project_id));

-- Owner/admin can manage memberships
CREATE POLICY project_members_insert ON project_members
  FOR INSERT WITH CHECK (
    auth.user_project_role(project_id) IN ('owner','admin')
  );

CREATE POLICY project_members_update ON project_members
  FOR UPDATE USING (
    auth.user_project_role(project_id) IN ('owner','admin')
  );

CREATE POLICY project_members_delete ON project_members
  FOR DELETE USING (
    auth.user_project_role(project_id) IN ('owner','admin')
  );


-- =============================================================================
-- 4. PREMOB_CHECKLIST
-- =============================================================================

CREATE POLICY premob_checklist_select ON premob_checklist
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY premob_checklist_insert ON premob_checklist
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY premob_checklist_update ON premob_checklist
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY premob_checklist_delete ON premob_checklist
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 5. MOB_CHECKLIST
-- =============================================================================

CREATE POLICY mob_checklist_select ON mob_checklist
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY mob_checklist_insert ON mob_checklist
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY mob_checklist_update ON mob_checklist
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY mob_checklist_delete ON mob_checklist
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 6. DEMOB_CHECKLIST
-- =============================================================================

CREATE POLICY demob_checklist_select ON demob_checklist
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY demob_checklist_insert ON demob_checklist
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY demob_checklist_update ON demob_checklist
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY demob_checklist_delete ON demob_checklist
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 7. KPI_DATA
-- =============================================================================

CREATE POLICY kpi_data_select ON kpi_data
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY kpi_data_insert ON kpi_data
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY kpi_data_update ON kpi_data
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY kpi_data_delete ON kpi_data
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 8. INSPECTIONS  (inspector can also write)
-- =============================================================================

CREATE POLICY inspections_select ON inspections
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY inspections_insert ON inspections
  FOR INSERT WITH CHECK (auth.can_inspect_project(project_id));

CREATE POLICY inspections_update ON inspections
  FOR UPDATE USING (auth.can_inspect_project(project_id));

CREATE POLICY inspections_delete ON inspections
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 9. TRAINING_RECORDS  (inspector can also write)
-- =============================================================================

CREATE POLICY training_records_select ON training_records
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY training_records_insert ON training_records
  FOR INSERT WITH CHECK (auth.can_inspect_project(project_id));

CREATE POLICY training_records_update ON training_records
  FOR UPDATE USING (auth.can_inspect_project(project_id));

CREATE POLICY training_records_delete ON training_records
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 10. EQUIPMENT
-- =============================================================================

CREATE POLICY equipment_select ON equipment
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY equipment_insert ON equipment
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY equipment_update ON equipment
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY equipment_delete ON equipment
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 11. INCIDENTS  (inspector can also write)
-- =============================================================================

CREATE POLICY incidents_select ON incidents
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY incidents_insert ON incidents
  FOR INSERT WITH CHECK (auth.can_inspect_project(project_id));

CREATE POLICY incidents_update ON incidents
  FOR UPDATE USING (auth.can_inspect_project(project_id));

CREATE POLICY incidents_delete ON incidents
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 12. SUBCONTRACTORS
-- =============================================================================

CREATE POLICY subcontractors_select ON subcontractors
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY subcontractors_insert ON subcontractors
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY subcontractors_update ON subcontractors
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY subcontractors_delete ON subcontractors
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 13. MANPOWER_MONTHLY
-- =============================================================================

CREATE POLICY manpower_monthly_select ON manpower_monthly
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY manpower_monthly_insert ON manpower_monthly
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY manpower_monthly_update ON manpower_monthly
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY manpower_monthly_delete ON manpower_monthly
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 14. DOCUMENTS
-- =============================================================================

CREATE POLICY documents_select ON documents
  FOR SELECT USING (auth.is_project_member(project_id));

CREATE POLICY documents_insert ON documents
  FOR INSERT WITH CHECK (auth.can_write_project(project_id));

CREATE POLICY documents_update ON documents
  FOR UPDATE USING (auth.can_write_project(project_id));

CREATE POLICY documents_delete ON documents
  FOR DELETE USING (auth.can_write_project(project_id));


-- =============================================================================
-- 15. AUDIT_LOG
-- =============================================================================

-- Only owner/admin can read the audit log
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
         AND p.role IN ('owner','admin')
    )
  );

-- Inserts are performed by server-side functions (SECURITY DEFINER)
-- No direct insert policy for regular users - use the log function below.

-- =============================================================================
-- AUDIT LOG INSERT FUNCTION (SECURITY DEFINER - bypasses RLS)
-- =============================================================================
CREATE OR REPLACE FUNCTION log_audit(
  p_action     TEXT,
  p_table_name TEXT,
  p_record_id  UUID DEFAULT NULL,
  p_old_data   JSONB DEFAULT NULL,
  p_new_data   JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_audit(TEXT, TEXT, UUID, JSONB, JSONB)
  IS 'Inserts an audit log entry. Runs as SECURITY DEFINER to bypass RLS.';
