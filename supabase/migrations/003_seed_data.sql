-- =============================================================================
-- EHSS Tracker - Seed Data
-- Migration 003: Checklist seeding function for new projects
-- =============================================================================

-- =============================================================================
-- FUNCTION: seed_project_checklists
-- Call this whenever a new project is created to populate the three checklists
-- with the standard EHSS items.
--
-- Usage:  SELECT seed_project_checklists('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
-- =============================================================================
CREATE OR REPLACE FUNCTION seed_project_checklists(p_project_id UUID)
RETURNS VOID AS $$
BEGIN

  -- =========================================================================
  -- PRE-MOBILIZATION CHECKLIST  (64 items, 8 sections x 8 items)
  -- =========================================================================

  -- Section 1: HSSE Management System (items 1-8)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'HSSE Management System', 1,  'HSSE Plan'),
    (p_project_id, 'HSSE Management System', 2,  'Risk Register'),
    (p_project_id, 'HSSE Management System', 3,  'Emergency Response Plan'),
    (p_project_id, 'HSSE Management System', 4,  'Environmental Management Plan'),
    (p_project_id, 'HSSE Management System', 5,  'Waste Management Plan'),
    (p_project_id, 'HSSE Management System', 6,  'Noise Management Plan'),
    (p_project_id, 'HSSE Management System', 7,  'Dust Control Plan'),
    (p_project_id, 'HSSE Management System', 8,  'Traffic Management Plan');

  -- Section 2: Risk Assessment (items 9-16)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Risk Assessment', 9,  'Project Risk Assessment'),
    (p_project_id, 'Risk Assessment', 10, 'Task-specific Risk Assessments'),
    (p_project_id, 'Risk Assessment', 11, 'HAZID Study'),
    (p_project_id, 'Risk Assessment', 12, 'SIMOPS Assessment'),
    (p_project_id, 'Risk Assessment', 13, 'Chemical Risk Assessment'),
    (p_project_id, 'Risk Assessment', 14, 'Noise Assessment'),
    (p_project_id, 'Risk Assessment', 15, 'Vibration Assessment'),
    (p_project_id, 'Risk Assessment', 16, 'Manual Handling Assessment');

  -- Section 3: Training & Competency (items 17-24)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Training & Competency', 17, 'HSSE Induction Package'),
    (p_project_id, 'Training & Competency', 18, 'Competency Matrix'),
    (p_project_id, 'Training & Competency', 19, 'Training Needs Analysis'),
    (p_project_id, 'Training & Competency', 20, 'First Aider Certification'),
    (p_project_id, 'Training & Competency', 21, 'Fire Warden Training'),
    (p_project_id, 'Training & Competency', 22, 'Confined Space Training'),
    (p_project_id, 'Training & Competency', 23, 'Working at Height Training'),
    (p_project_id, 'Training & Competency', 24, 'Lifting Operations Training');

  -- Section 4: Insurance & Legal (items 25-32)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Insurance & Legal', 25, 'Public Liability Insurance'),
    (p_project_id, 'Insurance & Legal', 26, 'Employer''s Liability Insurance'),
    (p_project_id, 'Insurance & Legal', 27, 'Professional Indemnity'),
    (p_project_id, 'Insurance & Legal', 28, 'Workers'' Compensation'),
    (p_project_id, 'Insurance & Legal', 29, 'Vehicle Insurance'),
    (p_project_id, 'Insurance & Legal', 30, 'Equipment Insurance'),
    (p_project_id, 'Insurance & Legal', 31, 'Environmental Liability'),
    (p_project_id, 'Insurance & Legal', 32, 'Legal Compliance Register');

  -- Section 5: Site Logistics (items 33-40)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Site Logistics', 33, 'Site Layout Plan'),
    (p_project_id, 'Site Logistics', 34, 'Access/Egress Routes'),
    (p_project_id, 'Site Logistics', 35, 'Emergency Assembly Points'),
    (p_project_id, 'Site Logistics', 36, 'Temporary Facilities Plan'),
    (p_project_id, 'Site Logistics', 37, 'Welfare Facilities'),
    (p_project_id, 'Site Logistics', 38, 'Storage Areas Plan'),
    (p_project_id, 'Site Logistics', 39, 'Laydown Areas'),
    (p_project_id, 'Site Logistics', 40, 'Security Plan');

  -- Section 6: Equipment & Plant (items 41-48)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Equipment & Plant', 41, 'Equipment Register'),
    (p_project_id, 'Equipment & Plant', 42, 'Third-party Certifications'),
    (p_project_id, 'Equipment & Plant', 43, 'Maintenance Schedule'),
    (p_project_id, 'Equipment & Plant', 44, 'Pre-use Checklists'),
    (p_project_id, 'Equipment & Plant', 45, 'Operator Certifications'),
    (p_project_id, 'Equipment & Plant', 46, 'Lifting Equipment Register'),
    (p_project_id, 'Equipment & Plant', 47, 'Electrical Equipment Register'),
    (p_project_id, 'Equipment & Plant', 48, 'Vehicle Fitness Certificates');

  -- Section 7: Permits & Approvals (items 49-56)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Permits & Approvals', 49, 'Construction Permit'),
    (p_project_id, 'Permits & Approvals', 50, 'Environmental Permit'),
    (p_project_id, 'Permits & Approvals', 51, 'Excavation Permit Template'),
    (p_project_id, 'Permits & Approvals', 52, 'Hot Work Permit Template'),
    (p_project_id, 'Permits & Approvals', 53, 'Confined Space Entry Template'),
    (p_project_id, 'Permits & Approvals', 54, 'Working at Height Template'),
    (p_project_id, 'Permits & Approvals', 55, 'Lifting Plan Template'),
    (p_project_id, 'Permits & Approvals', 56, 'Energized Systems Template');

  -- Section 8: Communication (items 57-64)
  INSERT INTO premob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Communication', 57, 'Communication Plan'),
    (p_project_id, 'Communication', 58, 'Stakeholder Register'),
    (p_project_id, 'Communication', 59, 'Reporting Templates'),
    (p_project_id, 'Communication', 60, 'Incident Notification Process'),
    (p_project_id, 'Communication', 61, 'Client Communication Protocol'),
    (p_project_id, 'Communication', 62, 'Subcontractor Communication'),
    (p_project_id, 'Communication', 63, 'Community Liaison Plan'),
    (p_project_id, 'Communication', 64, 'Emergency Contact List');


  -- =========================================================================
  -- MOBILIZATION CHECKLIST  (48 items, 6 sections x 8 items)
  -- =========================================================================

  -- Section 1: Site Setup & Safety (items 1-8)
  INSERT INTO mob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Site Setup & Safety', 1,  'Safety signage installed'),
    (p_project_id, 'Site Setup & Safety', 2,  'Barriers/fencing'),
    (p_project_id, 'Site Setup & Safety', 3,  'First aid stations'),
    (p_project_id, 'Site Setup & Safety', 4,  'Fire extinguishers'),
    (p_project_id, 'Site Setup & Safety', 5,  'Spill kits'),
    (p_project_id, 'Site Setup & Safety', 6,  'Emergency lighting'),
    (p_project_id, 'Site Setup & Safety', 7,  'PA system tested'),
    (p_project_id, 'Site Setup & Safety', 8,  'Wind socks installed');

  -- Section 2: Personnel Readiness (items 9-16)
  INSERT INTO mob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Personnel Readiness', 9,  'All inductions completed'),
    (p_project_id, 'Personnel Readiness', 10, 'Competency cards verified'),
    (p_project_id, 'Personnel Readiness', 11, 'Medical certificates valid'),
    (p_project_id, 'Personnel Readiness', 12, 'PPE issued and logged'),
    (p_project_id, 'Personnel Readiness', 13, 'ID cards issued'),
    (p_project_id, 'Personnel Readiness', 14, 'Accommodation arranged'),
    (p_project_id, 'Personnel Readiness', 15, 'Transport arranged'),
    (p_project_id, 'Personnel Readiness', 16, 'Worker welfare briefing');

  -- Section 3: Equipment Mobilization (items 17-24)
  INSERT INTO mob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Equipment Mobilization', 17, 'Equipment delivered'),
    (p_project_id, 'Equipment Mobilization', 18, 'Pre-use inspections done'),
    (p_project_id, 'Equipment Mobilization', 19, 'Third-party certs valid'),
    (p_project_id, 'Equipment Mobilization', 20, 'Operators assessed'),
    (p_project_id, 'Equipment Mobilization', 21, 'Maintenance kits available'),
    (p_project_id, 'Equipment Mobilization', 22, 'Fuel storage compliant'),
    (p_project_id, 'Equipment Mobilization', 23, 'Lifting equipment tested'),
    (p_project_id, 'Equipment Mobilization', 24, 'Electrical equipment PAT tested');

  -- Section 4: Systems & Processes (items 25-32)
  INSERT INTO mob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Systems & Processes', 25, 'PTW system operational'),
    (p_project_id, 'Systems & Processes', 26, 'Risk assessment process'),
    (p_project_id, 'Systems & Processes', 27, 'Incident reporting system'),
    (p_project_id, 'Systems & Processes', 28, 'Inspection schedule set'),
    (p_project_id, 'Systems & Processes', 29, 'Toolbox talk schedule'),
    (p_project_id, 'Systems & Processes', 30, 'Safety observation program'),
    (p_project_id, 'Systems & Processes', 31, 'Environmental monitoring'),
    (p_project_id, 'Systems & Processes', 32, 'Waste management active');

  -- Section 5: Documentation (items 33-40)
  INSERT INTO mob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Documentation', 33, 'All permits obtained'),
    (p_project_id, 'Documentation', 34, 'Insurance certificates filed'),
    (p_project_id, 'Documentation', 35, 'Emergency plan distributed'),
    (p_project_id, 'Documentation', 36, 'Contact lists posted'),
    (p_project_id, 'Documentation', 37, 'SDS sheets available'),
    (p_project_id, 'Documentation', 38, 'Drawings issued'),
    (p_project_id, 'Documentation', 39, 'Method statements approved'),
    (p_project_id, 'Documentation', 40, 'ITP documents ready');

  -- Section 6: Consultant Baseline (items 41-48)
  INSERT INTO mob_checklist (project_id, section, item_number, description) VALUES
    (p_project_id, 'Consultant Baseline', 41, 'KPI baseline set'),
    (p_project_id, 'Consultant Baseline', 42, 'Inspection forms ready'),
    (p_project_id, 'Consultant Baseline', 43, 'Training matrix finalized'),
    (p_project_id, 'Consultant Baseline', 44, 'Reporting templates set'),
    (p_project_id, 'Consultant Baseline', 45, 'Audit schedule planned'),
    (p_project_id, 'Consultant Baseline', 46, 'Compliance checklist done'),
    (p_project_id, 'Consultant Baseline', 47, 'Communication tested'),
    (p_project_id, 'Consultant Baseline', 48, 'Handover notes prepared');


  -- =========================================================================
  -- DEMOBILIZATION CHECKLIST  (35 items, 5 sections x 7 items, with priority)
  -- =========================================================================

  -- Section 1: Site Closure (items 1-7, HIGH priority)
  INSERT INTO demob_checklist (project_id, section, item_number, description, priority) VALUES
    (p_project_id, 'Site Closure', 1,  'Remove all temporary structures',              'HIGH'),
    (p_project_id, 'Site Closure', 2,  'Environmental remediation complete',            'HIGH'),
    (p_project_id, 'Site Closure', 3,  'Contaminated soil disposed',                    'HIGH'),
    (p_project_id, 'Site Closure', 4,  'Site restored to original condition',            'HIGH'),
    (p_project_id, 'Site Closure', 5,  'Final environmental inspection',                'HIGH'),
    (p_project_id, 'Site Closure', 6,  'Waste disposal records complete',               'HIGH'),
    (p_project_id, 'Site Closure', 7,  'Pollution prevention measures removed',          'HIGH');

  -- Section 2: Equipment & Materials (items 8-14, HIGH priority)
  INSERT INTO demob_checklist (project_id, section, item_number, description, priority) VALUES
    (p_project_id, 'Equipment & Materials', 8,  'All equipment demobilized',             'HIGH'),
    (p_project_id, 'Equipment & Materials', 9,  'Final equipment inspections',           'HIGH'),
    (p_project_id, 'Equipment & Materials', 10, 'Rental equipment returned',             'HIGH'),
    (p_project_id, 'Equipment & Materials', 11, 'Fuel/chemicals removed',                'HIGH'),
    (p_project_id, 'Equipment & Materials', 12, 'Hazmat materials disposed',             'HIGH'),
    (p_project_id, 'Equipment & Materials', 13, 'Equipment maintenance records closed',  'HIGH'),
    (p_project_id, 'Equipment & Materials', 14, 'Asset register updated',                'HIGH');

  -- Section 3: Personnel (items 15-21, MEDIUM priority)
  INSERT INTO demob_checklist (project_id, section, item_number, description, priority) VALUES
    (p_project_id, 'Personnel', 15, 'Final safety briefing',                  'MEDIUM'),
    (p_project_id, 'Personnel', 16, 'Exit medical examinations',              'MEDIUM'),
    (p_project_id, 'Personnel', 17, 'Training records archived',              'MEDIUM'),
    (p_project_id, 'Personnel', 18, 'Personnel records updated',              'MEDIUM'),
    (p_project_id, 'Personnel', 19, 'Final timesheets approved',              'MEDIUM'),
    (p_project_id, 'Personnel', 20, 'Worker feedback collected',              'MEDIUM'),
    (p_project_id, 'Personnel', 21, 'Welfare facilities decommissioned',      'MEDIUM');

  -- Section 4: Documentation (items 22-28, MEDIUM priority)
  INSERT INTO demob_checklist (project_id, section, item_number, description, priority) VALUES
    (p_project_id, 'Documentation', 22, 'Final project report',               'MEDIUM'),
    (p_project_id, 'Documentation', 23, 'Lessons learned documented',         'MEDIUM'),
    (p_project_id, 'Documentation', 24, 'All permits closed',                 'MEDIUM'),
    (p_project_id, 'Documentation', 25, 'Insurance claims finalized',         'MEDIUM'),
    (p_project_id, 'Documentation', 26, 'Audit findings closed out',          'MEDIUM'),
    (p_project_id, 'Documentation', 27, 'Document archive completed',         'MEDIUM'),
    (p_project_id, 'Documentation', 28, 'Handover documents prepared',        'MEDIUM');

  -- Section 5: Compliance & Closeout (items 29-35, LOW priority)
  INSERT INTO demob_checklist (project_id, section, item_number, description, priority) VALUES
    (p_project_id, 'Compliance & Closeout', 29, 'Final KPI report',                  'LOW'),
    (p_project_id, 'Compliance & Closeout', 30, 'Regulatory notifications',          'LOW'),
    (p_project_id, 'Compliance & Closeout', 31, 'Client acceptance received',        'LOW'),
    (p_project_id, 'Compliance & Closeout', 32, 'Subcontractor evaluations done',    'LOW'),
    (p_project_id, 'Compliance & Closeout', 33, 'Final payment certificates',        'LOW'),
    (p_project_id, 'Compliance & Closeout', 34, 'Performance bonds released',        'LOW'),
    (p_project_id, 'Compliance & Closeout', 35, 'Project closeout meeting',          'LOW');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION seed_project_checklists(UUID)
  IS 'Populates premob (64), mob (48), and demob (35) checklist items for a new project';
