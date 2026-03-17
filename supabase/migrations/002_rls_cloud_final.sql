-- =============================================================================
-- EHSS Tracker - RLS Policies (Supabase Cloud) - NO auth schema writes
-- All helper functions in PUBLIC schema, using auth.uid() only (which is allowed)
-- =============================================================================

-- Helper functions in PUBLIC schema
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_project_role(p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_global_role TEXT;
  v_project_role TEXT;
BEGIN
  SELECT role INTO v_global_role FROM profiles WHERE id = auth.uid();
  IF v_global_role = 'owner' THEN RETURN 'owner'; END IF;
  IF v_global_role = 'admin' THEN RETURN 'admin'; END IF;
  SELECT pm.role INTO v_project_role FROM project_members pm
    WHERE pm.project_id = p_project_id AND pm.user_id = auth.uid();
  RETURN v_project_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_project_role(p_project_id) IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_write_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_project_role(p_project_id) IN ('owner','admin','pm');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_inspect_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_project_role(p_project_id) IN ('owner','admin','pm','inspector');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- =============================================================================
-- ENABLE RLS
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
-- PROFILES POLICIES
-- =============================================================================
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_select_admin ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner','admin')
);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_owner ON profiles FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);

-- =============================================================================
-- PROJECTS POLICIES
-- =============================================================================
CREATE POLICY projects_select_member ON projects FOR SELECT USING (public.is_project_member(id));
CREATE POLICY projects_insert_admin ON projects FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner','admin')
);
CREATE POLICY projects_update ON projects FOR UPDATE USING (
  public.user_project_role(id) IN ('owner','admin','pm')
);
CREATE POLICY projects_delete_owner ON projects FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
);

-- =============================================================================
-- PROJECT_MEMBERS POLICIES
-- =============================================================================
CREATE POLICY project_members_select ON project_members FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY project_members_insert ON project_members FOR INSERT WITH CHECK (public.user_project_role(project_id) IN ('owner','admin'));
CREATE POLICY project_members_update ON project_members FOR UPDATE USING (public.user_project_role(project_id) IN ('owner','admin'));
CREATE POLICY project_members_delete ON project_members FOR DELETE USING (public.user_project_role(project_id) IN ('owner','admin'));

-- =============================================================================
-- PREMOB POLICIES
-- =============================================================================
CREATE POLICY premob_checklist_select ON premob_checklist FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY premob_checklist_insert ON premob_checklist FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY premob_checklist_update ON premob_checklist FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY premob_checklist_delete ON premob_checklist FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- MOB POLICIES
-- =============================================================================
CREATE POLICY mob_checklist_select ON mob_checklist FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY mob_checklist_insert ON mob_checklist FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY mob_checklist_update ON mob_checklist FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY mob_checklist_delete ON mob_checklist FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- DEMOB POLICIES
-- =============================================================================
CREATE POLICY demob_checklist_select ON demob_checklist FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY demob_checklist_insert ON demob_checklist FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY demob_checklist_update ON demob_checklist FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY demob_checklist_delete ON demob_checklist FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- KPI POLICIES
-- =============================================================================
CREATE POLICY kpi_data_select ON kpi_data FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY kpi_data_insert ON kpi_data FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY kpi_data_update ON kpi_data FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY kpi_data_delete ON kpi_data FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- INSPECTIONS POLICIES (inspector can write)
-- =============================================================================
CREATE POLICY inspections_select ON inspections FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY inspections_insert ON inspections FOR INSERT WITH CHECK (public.can_inspect_project(project_id));
CREATE POLICY inspections_update ON inspections FOR UPDATE USING (public.can_inspect_project(project_id));
CREATE POLICY inspections_delete ON inspections FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- TRAINING POLICIES (inspector can write)
-- =============================================================================
CREATE POLICY training_records_select ON training_records FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY training_records_insert ON training_records FOR INSERT WITH CHECK (public.can_inspect_project(project_id));
CREATE POLICY training_records_update ON training_records FOR UPDATE USING (public.can_inspect_project(project_id));
CREATE POLICY training_records_delete ON training_records FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- EQUIPMENT POLICIES
-- =============================================================================
CREATE POLICY equipment_select ON equipment FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY equipment_insert ON equipment FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY equipment_update ON equipment FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY equipment_delete ON equipment FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- INCIDENTS POLICIES (inspector can write)
-- =============================================================================
CREATE POLICY incidents_select ON incidents FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY incidents_insert ON incidents FOR INSERT WITH CHECK (public.can_inspect_project(project_id));
CREATE POLICY incidents_update ON incidents FOR UPDATE USING (public.can_inspect_project(project_id));
CREATE POLICY incidents_delete ON incidents FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- SUBCONTRACTORS POLICIES
-- =============================================================================
CREATE POLICY subcontractors_select ON subcontractors FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY subcontractors_insert ON subcontractors FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY subcontractors_update ON subcontractors FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY subcontractors_delete ON subcontractors FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- MANPOWER POLICIES
-- =============================================================================
CREATE POLICY manpower_monthly_select ON manpower_monthly FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY manpower_monthly_insert ON manpower_monthly FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY manpower_monthly_update ON manpower_monthly FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY manpower_monthly_delete ON manpower_monthly FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- DOCUMENTS POLICIES
-- =============================================================================
CREATE POLICY documents_select ON documents FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY documents_insert ON documents FOR INSERT WITH CHECK (public.can_write_project(project_id));
CREATE POLICY documents_update ON documents FOR UPDATE USING (public.can_write_project(project_id));
CREATE POLICY documents_delete ON documents FOR DELETE USING (public.can_write_project(project_id));

-- =============================================================================
-- AUDIT LOG POLICIES
-- =============================================================================
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner','admin')
);

CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT, p_table_name TEXT, p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL, p_new_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
