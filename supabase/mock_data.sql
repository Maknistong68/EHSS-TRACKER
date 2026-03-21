-- =============================================================================
-- EHSS Tracker - Realistic Mock Data
-- Project: Sample Construction Project
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

DO $$
DECLARE
  v_pid UUID;
  v_uid UUID;
BEGIN

  -- =====================================================
  -- 1. GET FIRST USER & SET AS OWNER
  -- =====================================================
  SELECT id INTO v_uid FROM profiles ORDER BY created_at LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No user found. Register an account first, then run this.';
  END IF;
  UPDATE profiles SET role = 'owner' WHERE id = v_uid;

  -- =====================================================
  -- 2. CREATE MOCK PROJECT
  -- =====================================================
  INSERT INTO projects (name, contract_no, location, region, start_year, status, created_by)
  VALUES ('Marina & Yacht Club', 'MYC-2024-0847', 'Coastal Zone, Sector A', 'Jeddah', 2024, 'active', v_uid)
  RETURNING id INTO v_pid;

  INSERT INTO project_members (project_id, user_id, role)
  VALUES (v_pid, v_uid, 'admin');

  -- =====================================================
  -- 3. SEED & COMPLETE CHECKLISTS
  -- =====================================================
  PERFORM seed_project_checklists(v_pid);

  -- Premob ~84% complete (items 1-54 of 64)
  UPDATE premob_checklist
  SET completed = TRUE, completed_by = v_uid,
      completed_at = NOW() - INTERVAL '90 days',
      notes = 'Reviewed and approved'
  WHERE project_id = v_pid AND item_number <= 54;

  -- Mob ~75% complete (items 1-36 of 48)
  UPDATE mob_checklist
  SET completed = TRUE, completed_by = v_uid,
      completed_at = NOW() - INTERVAL '60 days',
      notes = 'Verified on site'
  WHERE project_id = v_pid AND item_number <= 36;

  -- Demob ~9% (items 1-3 of 35)
  UPDATE demob_checklist
  SET completed = TRUE, completed_by = v_uid,
      completed_at = NOW() - INTERVAL '14 days',
      notes = 'Early planning phase'
  WHERE project_id = v_pid AND item_number <= 3;

  -- =====================================================
  -- 4. KPI DATA - Safety Performance (001-008)
  -- =====================================================

  -- 001 TRIR (lower is better, target 0.5)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-001', y, m, v, 0.5,
    CASE WHEN v <= 0.5 THEN 'green' WHEN v <= 1.0 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,0.72),(2025,2,0.68),(2025,3,0.61),(2025,4,0.55),(2025,5,0.48),
    (2025,6,0.45),(2025,7,0.42),(2025,8,0.38),(2025,9,0.35),(2025,10,0.33),
    (2025,11,0.31),(2025,12,0.28),(2026,1,0.25),(2026,2,0.22)
  ) AS t(y,m,v);

  -- 002 LTIFR (lower is better, target 0.2)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-002', y, m, v, 0.2,
    CASE WHEN v <= 0.2 THEN 'green' WHEN v <= 0.5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,0.35),(2025,2,0.32),(2025,3,0.28),(2025,4,0.25),(2025,5,0.22),
    (2025,6,0.20),(2025,7,0.18),(2025,8,0.15),(2025,9,0.14),(2025,10,0.12),
    (2025,11,0.10),(2025,12,0.08),(2026,1,0.07),(2026,2,0.05)
  ) AS t(y,m,v);

  -- 003 Fatalities (target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-003', y, m, 0, 0, 'green'
  FROM generate_series(1,12) AS m, (VALUES (2025)) AS t(y)
  UNION ALL
  SELECT v_pid, 'EHSS-003', 2026, m, 0, 0, 'green'
  FROM generate_series(1,2) AS m;

  -- 004 First Aid Cases (lower better, target 5)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-004', y, m, v, 5,
    CASE WHEN v <= 5 THEN 'green' WHEN v <= 10 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,6),(2025,2,5),(2025,3,7),(2025,4,4),(2025,5,3),
    (2025,6,5),(2025,7,4),(2025,8,3),(2025,9,2),(2025,10,3),
    (2025,11,2),(2025,12,1),(2026,1,2),(2026,2,1)
  ) AS t(y,m,v);

  -- 005 Near Miss Reports (higher better, target 10)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-005', y, m, v, 10,
    CASE WHEN v >= 10 THEN 'green' WHEN v >= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,6),(2025,2,7),(2025,3,9),(2025,4,11),(2025,5,12),
    (2025,6,14),(2025,7,15),(2025,8,16),(2025,9,18),(2025,10,17),
    (2025,11,19),(2025,12,21),(2026,1,20),(2026,2,22)
  ) AS t(y,m,v);

  -- 006 Lost Work Days (lower better, target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-006', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,3),(2025,2,2),(2025,3,0),(2025,4,1),(2025,5,0),
    (2025,6,0),(2025,7,2),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 007 Restricted Work Cases (lower better, target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-007', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,1),(2025,2,1),(2025,3,0),(2025,4,0),(2025,5,1),
    (2025,6,0),(2025,7,0),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 008 Safety Observation Rate (higher better, target 20)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-008', y, m, v, 20,
    CASE WHEN v >= 20 THEN 'green' WHEN v >= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,12),(2025,2,14),(2025,3,16),(2025,4,18),(2025,5,20),
    (2025,6,22),(2025,7,24),(2025,8,25),(2025,9,26),(2025,10,27),
    (2025,11,28),(2025,12,30),(2026,1,29),(2026,2,31)
  ) AS t(y,m,v);

  -- =====================================================
  -- 5. KPI DATA - Inspection & Audit (009-016)
  -- =====================================================

  -- 009 HSE Inspections Completed (higher better, target 20)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-009', y, m, v, 20,
    CASE WHEN v >= 20 THEN 'green' WHEN v >= 10 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,14),(2025,2,16),(2025,3,18),(2025,4,19),(2025,5,21),
    (2025,6,22),(2025,7,23),(2025,8,24),(2025,9,25),(2025,10,24),
    (2025,11,26),(2025,12,25),(2026,1,24),(2026,2,26)
  ) AS t(y,m,v);

  -- 010 Inspection Findings Closed % (higher better, target 90)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-010', y, m, v, 90,
    CASE WHEN v >= 90 THEN 'green' WHEN v >= 70 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,78),(2025,2,80),(2025,3,83),(2025,4,85),(2025,5,87),
    (2025,6,89),(2025,7,91),(2025,8,92),(2025,9,93),(2025,10,94),
    (2025,11,95),(2025,12,96),(2026,1,95),(2026,2,97)
  ) AS t(y,m,v);

  -- 011 NCR Closure Rate % (higher better, target 95)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-011', y, m, v, 95,
    CASE WHEN v >= 95 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,82),(2025,2,84),(2025,3,86),(2025,4,88),(2025,5,90),
    (2025,6,91),(2025,7,93),(2025,8,94),(2025,9,95),(2025,10,96),
    (2025,11,97),(2025,12,98),(2026,1,97),(2026,2,98)
  ) AS t(y,m,v);

  -- 012 Management Safety Tours (higher better, target 4)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-012', y, m, v, 4,
    CASE WHEN v >= 4 THEN 'green' WHEN v >= 2 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,2),(2025,2,3),(2025,3,3),(2025,4,4),(2025,5,4),
    (2025,6,5),(2025,7,4),(2025,8,5),(2025,9,5),(2025,10,6),
    (2025,11,5),(2025,12,6),(2026,1,5),(2026,2,6)
  ) AS t(y,m,v);

  -- 013 Third Party Audit Score % (quarterly, target 90)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-013', y, m, v, 90,
    CASE WHEN v >= 90 THEN 'green' WHEN v >= 70 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,82),(2025,6,86),(2025,9,91),(2025,12,93)) AS t(y,m,v);

  -- 014 Internal Audit Findings Open (lower better, target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-014', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 10 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,8),(2025,2,7),(2025,3,6),(2025,4,5),(2025,5,4),
    (2025,6,3),(2025,7,3),(2025,8,2),(2025,9,2),(2025,10,1),
    (2025,11,1),(2025,12,0),(2026,1,1),(2026,2,0)
  ) AS t(y,m,v);

  -- 015 Corrective Actions Overdue (lower better, target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-015', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,4),(2025,2,3),(2025,3,3),(2025,4,2),(2025,5,2),
    (2025,6,1),(2025,7,1),(2025,8,0),(2025,9,1),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 016 Compliance Audit Score % (quarterly, target 95)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-016', y, m, v, 95,
    CASE WHEN v >= 95 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,85),(2025,6,89),(2025,9,93),(2025,12,96)) AS t(y,m,v);

  -- =====================================================
  -- 6. KPI DATA - Training & Competency (017-024)
  -- =====================================================

  -- 017 Induction Completion Rate %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-017', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,92),(2025,2,94),(2025,3,95),(2025,4,96),(2025,5,97),
    (2025,6,98),(2025,7,98),(2025,8,99),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 018 Toolbox Talk Attendance %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-018', y, m, v, 95,
    CASE WHEN v >= 95 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,85),(2025,2,87),(2025,3,89),(2025,4,91),(2025,5,93),
    (2025,6,94),(2025,7,95),(2025,8,96),(2025,9,97),(2025,10,96),
    (2025,11,97),(2025,12,98),(2026,1,97),(2026,2,98)
  ) AS t(y,m,v);

  -- 019 Competency Assessments % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-019', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 85 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,88),(2025,6,92),(2025,9,96),(2025,12,100)) AS t(y,m,v);

  -- 020 Specialized Training % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-020', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,90),(2025,6,94),(2025,9,97),(2025,12,100)) AS t(y,m,v);

  -- 021 Training Hours per Worker
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-021', y, m, v, 8,
    CASE WHEN v >= 8 THEN 'green' WHEN v >= 4 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,5),(2025,2,6),(2025,3,6),(2025,4,7),(2025,5,7),
    (2025,6,8),(2025,7,8),(2025,8,9),(2025,9,9),(2025,10,10),
    (2025,11,10),(2025,12,11),(2026,1,10),(2026,2,11)
  ) AS t(y,m,v);

  -- 022 Expired Certifications (lower better, target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-022', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,4),(2025,2,3),(2025,3,2),(2025,4,2),(2025,5,1),
    (2025,6,1),(2025,7,0),(2025,8,1),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,1),(2026,2,0)
  ) AS t(y,m,v);

  -- 023 Emergency Drill Participation % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-023', y, m, v, 95,
    CASE WHEN v >= 95 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,88),(2025,6,92),(2025,9,96),(2025,12,98)) AS t(y,m,v);

  -- 024 Supervisor HSE Training % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-024', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,91),(2025,6,95),(2025,9,98),(2025,12,100)) AS t(y,m,v);

  -- =====================================================
  -- 7. KPI DATA - Environmental (025-032)
  -- =====================================================

  -- 025 Environmental Incidents (lower better, target 0)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-025', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,2),(2025,2,1),(2025,3,1),(2025,4,2),(2025,5,0),
    (2025,6,1),(2025,7,0),(2025,8,0),(2025,9,1),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 026 Waste Recycling Rate %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-026', y, m, v, 60,
    CASE WHEN v >= 60 THEN 'green' WHEN v >= 30 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,42),(2025,2,45),(2025,3,48),(2025,4,52),(2025,5,55),
    (2025,6,58),(2025,7,60),(2025,8,62),(2025,9,64),(2025,10,65),
    (2025,11,67),(2025,12,68),(2026,1,70),(2026,2,72)
  ) AS t(y,m,v);

  -- 027 Water Usage vs Target %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-027', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,88),(2025,2,90),(2025,3,92),(2025,4,94),(2025,5,95),
    (2025,6,96),(2025,7,97),(2025,8,98),(2025,9,99),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 028 Dust Complaints (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-028', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,3),(2025,2,2),(2025,3,2),(2025,4,1),(2025,5,1),
    (2025,6,0),(2025,7,1),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 029 Noise Complaints (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-029', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,2),(2025,2,1),(2025,3,1),(2025,4,0),(2025,5,1),
    (2025,6,0),(2025,7,0),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 030 Spill Incidents (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-030', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 2 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,1),(2025,2,0),(2025,3,1),(2025,4,0),(2025,5,0),
    (2025,6,0),(2025,7,1),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 031 Carbon Emission Tracking %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-031', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 70 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,75),(2025,2,78),(2025,3,82),(2025,4,85),(2025,5,88),
    (2025,6,90),(2025,7,92),(2025,8,94),(2025,9,96),(2025,10,98),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 032 Environmental Compliance Score % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-032', y, m, v, 95,
    CASE WHEN v >= 95 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,84),(2025,6,89),(2025,9,94),(2025,12,97)) AS t(y,m,v);

  -- =====================================================
  -- 8. KPI DATA - Permit to Work (033-039)
  -- =====================================================

  -- 033 PTW Compliance Rate %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-033', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,93),(2025,2,94),(2025,3,95),(2025,4,96),(2025,5,97),
    (2025,6,98),(2025,7,99),(2025,8,99),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 034 PTW Audits Conducted
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-034', y, m, v, 10,
    CASE WHEN v >= 10 THEN 'green' WHEN v >= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,6),(2025,2,7),(2025,3,8),(2025,4,9),(2025,5,10),
    (2025,6,11),(2025,7,12),(2025,8,12),(2025,9,13),(2025,10,12),
    (2025,11,14),(2025,12,13),(2026,1,12),(2026,2,14)
  ) AS t(y,m,v);

  -- 035 PTW Violations (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-035', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,3),(2025,2,2),(2025,3,2),(2025,4,1),(2025,5,1),
    (2025,6,0),(2025,7,1),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 036-039 Tracking only (no RAG)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, code, y, m, v, NULL, NULL
  FROM (VALUES
    ('EHSS-036',2025,1,8),('EHSS-036',2025,2,10),('EHSS-036',2025,3,12),
    ('EHSS-036',2025,4,11),('EHSS-036',2025,5,14),('EHSS-036',2025,6,13),
    ('EHSS-036',2025,7,15),('EHSS-036',2025,8,14),('EHSS-036',2025,9,16),
    ('EHSS-036',2025,10,15),('EHSS-036',2025,11,17),('EHSS-036',2025,12,16),
    ('EHSS-037',2025,1,3),('EHSS-037',2025,2,4),('EHSS-037',2025,3,5),
    ('EHSS-037',2025,4,4),('EHSS-037',2025,5,6),('EHSS-037',2025,6,5),
    ('EHSS-037',2025,7,7),('EHSS-037',2025,8,6),('EHSS-037',2025,9,5),
    ('EHSS-037',2025,10,6),('EHSS-037',2025,11,4),('EHSS-037',2025,12,5),
    ('EHSS-038',2025,1,12),('EHSS-038',2025,2,14),('EHSS-038',2025,3,16),
    ('EHSS-038',2025,4,18),('EHSS-038',2025,5,15),('EHSS-038',2025,6,17),
    ('EHSS-038',2025,7,14),('EHSS-038',2025,8,13),('EHSS-038',2025,9,12),
    ('EHSS-038',2025,10,11),('EHSS-038',2025,11,10),('EHSS-038',2025,12,9),
    ('EHSS-039',2025,1,20),('EHSS-039',2025,2,22),('EHSS-039',2025,3,25),
    ('EHSS-039',2025,4,28),('EHSS-039',2025,5,30),('EHSS-039',2025,6,32),
    ('EHSS-039',2025,7,35),('EHSS-039',2025,8,33),('EHSS-039',2025,9,30),
    ('EHSS-039',2025,10,28),('EHSS-039',2025,11,25),('EHSS-039',2025,12,22)
  ) AS t(code,y,m,v);

  -- =====================================================
  -- 9. KPI DATA - Emergency Response (040-046)
  -- =====================================================

  -- 040 Emergency Drills Conducted
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-040', y, m, v, 2,
    CASE WHEN v >= 2 THEN 'green' WHEN v >= 1 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,1),(2025,2,2),(2025,3,2),(2025,4,2),(2025,5,3),
    (2025,6,2),(2025,7,3),(2025,8,2),(2025,9,3),(2025,10,2),
    (2025,11,3),(2025,12,2),(2026,1,2),(2026,2,3)
  ) AS t(y,m,v);

  -- 041 Emergency Response Time (lower better, target 5 min)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-041', y, m, v, 5,
    CASE WHEN v <= 5 THEN 'green' WHEN v <= 15 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,12),(2025,2,10),(2025,3,8),(2025,4,7),(2025,5,6),
    (2025,6,5),(2025,7,5),(2025,8,4),(2025,9,4),(2025,10,4),
    (2025,11,3),(2025,12,3),(2026,1,3),(2026,2,3)
  ) AS t(y,m,v);

  -- 042 First Aider Ratio
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-042', y, m, v, 1,
    CASE WHEN v >= 1 THEN 'green' WHEN v >= 0.5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,0.8),(2025,2,0.9),(2025,3,1.0),(2025,4,1.0),(2025,5,1.1),
    (2025,6,1.1),(2025,7,1.2),(2025,8,1.2),(2025,9,1.2),(2025,10,1.3),
    (2025,11,1.3),(2025,12,1.3),(2026,1,1.2),(2026,2,1.3)
  ) AS t(y,m,v);

  -- 043 Fire Extinguisher Inspection %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-043', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,92),(2025,2,94),(2025,3,96),(2025,4,98),(2025,5,100),
    (2025,6,100),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 044 Emergency Equipment Status %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-044', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,90),(2025,2,92),(2025,3,95),(2025,4,96),(2025,5,98),
    (2025,6,100),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 045 Evacuation Drill Time (quarterly, lower better, target 10 min)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-045', y, m, v, 10,
    CASE WHEN v <= 10 THEN 'green' WHEN v <= 20 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,18),(2025,6,14),(2025,9,10),(2025,12,8)) AS t(y,m,v);

  -- 046 Communication System Test %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-046', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,92),(2025,2,95),(2025,3,98),(2025,4,100),(2025,5,100),
    (2025,6,100),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- =====================================================
  -- 10. KPI DATA - Health & Welfare (047-053)
  -- =====================================================

  -- 047 Heat Stress Incidents (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-047', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,0),(2025,2,0),(2025,3,0),(2025,4,1),(2025,5,2),
    (2025,6,4),(2025,7,5),(2025,8,3),(2025,9,2),(2025,10,1),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 048 Medical Screenings Completed %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-048', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,94),(2025,2,96),(2025,3,97),(2025,4,98),(2025,5,99),
    (2025,6,100),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 049 Occupational Health Cases (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-049', y, m, v, 0,
    CASE WHEN v = 0 THEN 'green' WHEN v <= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,1),(2025,2,0),(2025,3,1),(2025,4,0),(2025,5,0),
    (2025,6,1),(2025,7,0),(2025,8,0),(2025,9,0),(2025,10,0),
    (2025,11,0),(2025,12,0),(2026,1,0),(2026,2,0)
  ) AS t(y,m,v);

  -- 050 Welfare Facility Compliance %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-050', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 85 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,88),(2025,2,90),(2025,3,92),(2025,4,94),(2025,5,96),
    (2025,6,98),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 051 Drinking Water Quality %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-051', y, m, 100, 100, 'green'
  FROM generate_series(1,12) AS m, (VALUES (2025)) AS t(y)
  UNION ALL
  SELECT v_pid, 'EHSS-051', 2026, m, 100, 100, 'green'
  FROM generate_series(1,2) AS m;

  -- 052 Rest Break Compliance %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-052', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,94),(2025,2,95),(2025,3,96),(2025,4,97),(2025,5,98),
    (2025,6,99),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 053 Worker Satisfaction Score % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-053', y, m, v, 80,
    CASE WHEN v >= 80 THEN 'green' WHEN v >= 60 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,72),(2025,6,78),(2025,9,83),(2025,12,86)) AS t(y,m,v);

  -- =====================================================
  -- 11. KPI DATA - Subcontractor Mgmt (054-060)
  -- =====================================================

  -- 054 Subcontractor Pre-qualification % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-054', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,92),(2025,6,96),(2025,9,100),(2025,12,100)) AS t(y,m,v);

  -- 055 Subcontractor Audit Score % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-055', y, m, v, 85,
    CASE WHEN v >= 85 THEN 'green' WHEN v >= 70 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,78),(2025,6,83),(2025,9,87),(2025,12,90)) AS t(y,m,v);

  -- 056 Subcontractor NCR Rate (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-056', y, m, v, 1,
    CASE WHEN v <= 1 THEN 'green' WHEN v <= 3 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,3),(2025,2,2),(2025,3,2),(2025,4,2),(2025,5,1),
    (2025,6,1),(2025,7,1),(2025,8,1),(2025,9,0),(2025,10,1),
    (2025,11,0),(2025,12,0),(2026,1,1),(2026,2,0)
  ) AS t(y,m,v);

  -- 057 Subcontractor Training Compliance %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-057', y, m, v, 95,
    CASE WHEN v >= 95 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,82),(2025,2,84),(2025,3,86),(2025,4,88),(2025,5,90),
    (2025,6,92),(2025,7,93),(2025,8,95),(2025,9,96),(2025,10,97),
    (2025,11,98),(2025,12,98),(2026,1,97),(2026,2,98)
  ) AS t(y,m,v);

  -- 058 Subcontractor TRIR (lower better)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-058', y, m, v, 0.5,
    CASE WHEN v <= 0.5 THEN 'green' WHEN v <= 1.0 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,0.9),(2025,2,0.85),(2025,3,0.78),(2025,4,0.70),(2025,5,0.62),
    (2025,6,0.55),(2025,7,0.50),(2025,8,0.45),(2025,9,0.40),(2025,10,0.38),
    (2025,11,0.35),(2025,12,0.30),(2026,1,0.28),(2026,2,0.25)
  ) AS t(y,m,v);

  -- 059 Subcontractor PTW Compliance %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-059', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,90),(2025,2,92),(2025,3,93),(2025,4,95),(2025,5,96),
    (2025,6,97),(2025,7,98),(2025,8,99),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 060 Subcontractor Performance Reviews % (quarterly)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-060', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 80 THEN 'amber' ELSE 'red' END
  FROM (VALUES (2025,3,85),(2025,6,92),(2025,9,100),(2025,12,100)) AS t(y,m,v);

  -- =====================================================
  -- 12. KPI DATA - Eltizam Critical Controls (061-066)
  -- =====================================================

  -- 061-066 All % based, target 100, improving trend
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-061', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,92),(2025,2,93),(2025,3,94),(2025,4,95),(2025,5,96),
    (2025,6,97),(2025,7,98),(2025,8,99),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-062', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,90),(2025,2,91),(2025,3,93),(2025,4,94),(2025,5,95),
    (2025,6,96),(2025,7,97),(2025,8,98),(2025,9,99),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-063', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,94),(2025,2,95),(2025,3,96),(2025,4,97),(2025,5,98),
    (2025,6,99),(2025,7,100),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-064', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,91),(2025,2,93),(2025,3,94),(2025,4,95),(2025,5,96),
    (2025,6,97),(2025,7,98),(2025,8,99),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-065', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,93),(2025,2,94),(2025,3,95),(2025,4,96),(2025,5,97),
    (2025,6,98),(2025,7,99),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-066', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,90),(2025,2,92),(2025,3,94),(2025,4,95),(2025,5,96),
    (2025,6,97),(2025,7,98),(2025,8,99),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- =====================================================
  -- 13. KPI DATA - Manpower & Compliance (067-072)
  -- =====================================================

  -- 067 Total Manhours (tracking only)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-067', y, m, v, NULL, NULL
  FROM (VALUES
    (2025,1,31200),(2025,2,36000),(2025,3,43200),(2025,4,50400),
    (2025,5,57600),(2025,6,64800),(2025,7,72000),(2025,8,79200),
    (2025,9,86400),(2025,10,93600),(2025,11,100800),(2025,12,104000),
    (2026,1,108000),(2026,2,112000)
  ) AS t(y,m,v);

  -- 068 Overtime % (lower better, target 10)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-068', y, m, v, 10,
    CASE WHEN v <= 10 THEN 'green' WHEN v <= 15 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,14),(2025,2,13),(2025,3,12),(2025,4,11),(2025,5,10),
    (2025,6,9),(2025,7,10),(2025,8,8),(2025,9,9),(2025,10,8),
    (2025,11,7),(2025,12,8),(2026,1,7),(2026,2,7)
  ) AS t(y,m,v);

  -- 069 Absenteeism Rate % (lower better, target 3)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-069', y, m, v, 3,
    CASE WHEN v <= 3 THEN 'green' WHEN v <= 5 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,4.5),(2025,2,4.2),(2025,3,3.8),(2025,4,3.5),(2025,5,3.2),
    (2025,6,3.0),(2025,7,2.8),(2025,8,2.6),(2025,9,2.5),(2025,10,2.3),
    (2025,11,2.2),(2025,12,2.0),(2026,1,2.1),(2026,2,1.9)
  ) AS t(y,m,v);

  -- 070 Saudization Compliance % (quarterly, tracking)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-070', y, m, v, NULL, NULL
  FROM (VALUES (2025,3,12),(2025,6,14),(2025,9,16),(2025,12,18)) AS t(y,m,v);

  -- 071 Working Hours Compliance %
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, 'EHSS-071', y, m, v, 100,
    CASE WHEN v >= 100 THEN 'green' WHEN v >= 90 THEN 'amber' ELSE 'red' END
  FROM (VALUES
    (2025,1,92),(2025,2,93),(2025,3,95),(2025,4,96),(2025,5,97),
    (2025,6,98),(2025,7,99),(2025,8,100),(2025,9,100),(2025,10,100),
    (2025,11,100),(2025,12,100),(2026,1,100),(2026,2,100)
  ) AS t(y,m,v);

  -- 072 Ramadan Work Hour Compliance % (annual)
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  VALUES (v_pid, 'EHSS-072', 2025, 3, 100, 100, 'green');

  -- =====================================================
  -- 14. INSPECTIONS (40 records)
  -- =====================================================
  INSERT INTO inspections (project_id, inspection_date, type, location, inspector, findings, ncr_count, status, verified, created_by)
  VALUES
    (v_pid,'2025-01-08','Routine HSE','Zone A - Piling Area','Mohammed Al-Sharif','Incomplete barricading around excavation zone',2,'Closed',TRUE,v_uid),
    (v_pid,'2025-01-15','PPE Compliance','Worker Camp','Abdullah Al-Qahtani','3 workers without safety glasses in grinding area',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-01-22','Environmental','Marine Works Jetty','Khalid Al-Dosari','Minor diesel spill near fuel storage - contained',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-02-05','Scaffolding','Zone B - Steel Structure','Omar Patel','Missing toe boards on level 3 scaffolding',2,'Closed',TRUE,v_uid),
    (v_pid,'2025-02-12','Fire Safety','Main Office Complex','Ahmed Bin Saleh','Fire extinguisher in storeroom expired',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-02-20','Electrical Safety','Generator Compound','Fahd Al-Mutairi','Exposed wiring near temporary panel DB-07',2,'Closed',TRUE,v_uid),
    (v_pid,'2025-03-03','Routine HSE','Zone C - Concrete Works','Mohammed Al-Sharif','Good housekeeping observed. Minor signage gap.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-03-11','Management Walkthrough','Entire Site','Abdullah Al-Qahtani','Positive safety culture. Workers engaged in TBTs.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-03-18','Housekeeping','Material Laydown Area','Khalid Al-Dosari','Excessive debris near access road',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-04-02','PPE Compliance','Zone A - Marine Deck','Omar Patel','All workers compliant. Life jackets verified.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-04-14','Routine HSE','Zone B - MEP Corridor','Ahmed Bin Saleh','Tripping hazard from unsecured cables',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-04-28','Scaffolding','Zone D - Facade Works','Fahd Al-Mutairi','Scaffold tag system working well. No issues.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-05-06','Environmental','Waste Management Area','Mohammed Al-Sharif','Segregation bins mislabelled',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-05-19','Fire Safety','Accommodation Block','Abdullah Al-Qahtani','Emergency exit blocked by stored materials',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-05-27','Routine HSE','Zone C - Landscaping','Khalid Al-Dosari','Heat stress controls in place. Water stations adequate.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-06-03','Electrical Safety','Substation Area','Omar Patel','LOTO procedures followed correctly. Good practice.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-06-16','Management Walkthrough','Zones A & B','Ahmed Bin Saleh','Improvement in scaffold management noted',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-06-24','Housekeeping','All Zones','Fahd Al-Mutairi','Generally good. Minor oil stain in workshop.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-07-08','Routine HSE','Zone A - Structural','Mohammed Al-Sharif','Working at height controls excellent',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-07-15','PPE Compliance','Zone D - Painting Works','Abdullah Al-Qahtani','Respiratory protection verified for all painters',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-07-29','Environmental','Desalination Area','Khalid Al-Dosari','Brine discharge within permit limits',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-08-05','Scaffolding','Zone B - Cladding','Omar Patel','All scaffolds inspected and tagged. Green tags current.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-08-18','Fire Safety','Welding Workshop','Ahmed Bin Saleh','Hot work permits properly displayed. Fire watch in place.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-08-26','Routine HSE','Zone C - Utilities','Fahd Al-Mutairi','No findings. Excellent safety performance.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-09-02','Management Walkthrough','Full Site Tour','Mohammed Al-Sharif','Client representative impressed with safety culture.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-09-15','Electrical Safety','Zone A - Power Room','Abdullah Al-Qahtani','Arc flash labels installed. PPE matrix posted.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-09-22','Housekeeping','Workshops','Khalid Al-Dosari','All areas clean and organized. FIFO maintained.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-10-07','Routine HSE','Zone D - Finishes','Omar Patel','Solvent storage needs better ventilation',1,'Closed',TRUE,v_uid),
    (v_pid,'2025-10-14','PPE Compliance','All Zones','Ahmed Bin Saleh','100% compliance achieved across all zones',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-10-28','Environmental','Site Perimeter','Fahd Al-Mutairi','Dust suppression working effectively',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-11-04','Scaffolding','Zone A - Roofing','Mohammed Al-Sharif','Edge protection verified. Safety nets in place.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-11-18','Fire Safety','Main Site Offices','Abdullah Al-Qahtani','Fire drill conducted - 7 min evacuation time',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-11-25','Routine HSE','Zone B - Commissioning','Khalid Al-Dosari','Pre-commissioning safety checks complete',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-12-02','Management Walkthrough','Zones C & D','Omar Patel','Year-end safety review. Excellent improvements noted.',0,'Closed',TRUE,v_uid),
    (v_pid,'2025-12-16','Routine HSE','All Zones','Ahmed Bin Saleh','Year-end comprehensive inspection. All clear.',0,'Closed',TRUE,v_uid),
    (v_pid,'2026-01-06','Routine HSE','Zone A - Final Fit-out','Mohammed Al-Sharif','New year safety stand-down completed',0,'Closed',TRUE,v_uid),
    (v_pid,'2026-01-14','PPE Compliance','Zone B - Mechanical','Abdullah Al-Qahtani','New PPE batch distributed and verified',0,'Closed',TRUE,v_uid),
    (v_pid,'2026-01-28','Environmental','Entire Site','Khalid Al-Dosari','Environmental audit passed with zero NCRs',0,'Closed',TRUE,v_uid),
    (v_pid,'2026-02-04','Routine HSE','Zone C - External Works','Omar Patel','Minor housekeeping issue near Gate 2',0,'In Progress',FALSE,v_uid),
    (v_pid,'2026-02-18','Scaffolding','Zone D - Touch-up Works','Ahmed Bin Saleh','Scaffold inspection ongoing for demob planning',1,'Open',FALSE,v_uid);

  -- =====================================================
  -- 15. TRAINING RECORDS (32 employees)
  -- =====================================================
  INSERT INTO training_records (project_id, employee_name, employee_id, role, company, induction_date, card_expiry, training_type, status, verified, created_by)
  VALUES
    (v_pid,'Mohammed Al-Rashid','EMP-001','Site Foreman','Al Rashid Contracting','2025-01-05','2026-01-05','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Ahmed Hassan','EMP-002','Crane Operator','Al Rashid Contracting','2025-01-05','2026-01-05','Lifting Operations','Valid',TRUE,v_uid),
    (v_pid,'Yousef Al-Harbi','EMP-003','Scaffolder','Nesma & Partners','2025-01-08','2026-01-08','Working at Height','Valid',TRUE,v_uid),
    (v_pid,'Rajesh Kumar','EMP-004','Electrician','Al Bawani Company','2025-01-10','2026-01-10','Electrical Safety','Valid',TRUE,v_uid),
    (v_pid,'Fahd Al-Otaibi','EMP-005','Safety Officer','Eltizam EHSS','2025-01-03','2026-06-03','First Aid','Valid',TRUE,v_uid),
    (v_pid,'Omar Siddiqui','EMP-006','Welder','Arabian Bemco','2025-01-12','2026-01-12','Hot Work','Valid',TRUE,v_uid),
    (v_pid,'Khalid Mansour','EMP-007','Excavator Operator','Al Khodari Sons','2025-01-15','2026-01-15','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Sanjay Patel','EMP-008','Plumber','Al Rashid Contracting','2025-02-01','2026-02-01','Confined Space','Valid',TRUE,v_uid),
    (v_pid,'Abdullah Al-Zahrani','EMP-009','Fire Warden','Eltizam EHSS','2025-02-03','2026-02-03','Fire Warden','Valid',TRUE,v_uid),
    (v_pid,'Tariq Al-Malki','EMP-010','Project Manager','STRABAG','2025-01-02','2026-01-02','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Ravi Sharma','EMP-011','Steel Fixer','Nesma & Partners','2025-02-10','2026-02-10','Working at Height','Valid',TRUE,v_uid),
    (v_pid,'Hassan Al-Dossary','EMP-012','HSE Inspector','Eltizam EHSS','2025-01-03','2026-06-03','Permit to Work','Valid',TRUE,v_uid),
    (v_pid,'Nasser Al-Qahtani','EMP-013','Site Engineer','Al Rashid Contracting','2025-03-01','2026-03-01','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Deepak Verma','EMP-014','Painter','Arabian Bemco','2025-03-05','2026-03-05','Confined Space','Expiring',TRUE,v_uid),
    (v_pid,'Saeed Al-Amri','EMP-015','Rigger','Al Rashid Contracting','2025-03-10','2026-03-10','Lifting Operations','Expiring',TRUE,v_uid),
    (v_pid,'Imran Ali','EMP-016','Mason','Al Khodari Sons','2025-04-01','2026-04-01','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Faisal Al-Shehri','EMP-017','Mechanical Fitter','Arabian Bemco','2025-04-05','2026-04-05','Hot Work','Valid',TRUE,v_uid),
    (v_pid,'Suresh Reddy','EMP-018','Carpenter','Nesma & Partners','2025-04-12','2026-04-12','Working at Height','Valid',TRUE,v_uid),
    (v_pid,'Majed Al-Ghamdi','EMP-019','QC Inspector','STRABAG','2025-05-01','2026-05-01','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Bilal Ahmad','EMP-020','Pipe Fitter','Al Bawani Company','2025-05-08','2026-05-08','Confined Space','Valid',TRUE,v_uid),
    (v_pid,'Sultan Al-Mutairi','EMP-021','Equipment Operator','Al Khodari Sons','2025-06-01','2026-06-01','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Vikram Singh','EMP-022','Ironworker','Nesma & Partners','2025-06-15','2026-06-15','Scaffolding','Valid',TRUE,v_uid),
    (v_pid,'Waleed Al-Harthy','EMP-023','Supervisor','Al Rashid Contracting','2025-07-01','2026-07-01','Permit to Work','Valid',TRUE,v_uid),
    (v_pid,'Mohammad Iqbal','EMP-024','HVAC Technician','Al Bawani Company','2025-07-10','2026-07-10','Electrical Safety','Valid',TRUE,v_uid),
    (v_pid,'Bader Al-Enezi','EMP-025','Marine Foreman','STRABAG','2025-08-01','2026-08-01','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Arjun Mehta','EMP-026','Insulator','Arabian Bemco','2025-08-15','2026-08-15','Hot Work','Valid',TRUE,v_uid),
    (v_pid,'Hamad Al-Dosari','EMP-027','Safety Supervisor','Eltizam EHSS','2025-01-03','2026-06-03','First Aid','Valid',TRUE,v_uid),
    (v_pid,'Prakash Das','EMP-028','Scaffolder','Nesma & Partners','2025-09-01','2026-09-01','Scaffolding','Valid',TRUE,v_uid),
    (v_pid,'Turki Al-Saud','EMP-029','Civil Engineer','Al Rashid Contracting','2025-09-15','2026-09-15','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Ramesh Thapa','EMP-030','Helper','Al Khodari Sons','2025-10-01','2026-10-01','HSSE Induction','Valid',TRUE,v_uid),
    (v_pid,'Nawaf Al-Shammari','EMP-031','Crane Operator','STRABAG','2025-10-15','2026-10-15','Lifting Operations','Valid',TRUE,v_uid),
    (v_pid,'Anil Gupta','EMP-032','Electrician','Al Bawani Company','2025-01-10','2025-07-10','Electrical Safety','Expired',FALSE,v_uid);

  -- =====================================================
  -- 16. EQUIPMENT (28 items)
  -- =====================================================
  INSERT INTO equipment (project_id, type, equipment_id, serial_number, swl, cert_expiry, status, condition, verified, created_by)
  VALUES
    (v_pid,'Crane','CR-001','SN-TC-44521','50 tonnes','2026-06-15','Valid','Good',TRUE,v_uid),
    (v_pid,'Crane','CR-002','SN-TC-44522','25 tonnes','2026-04-20','Valid','Good',TRUE,v_uid),
    (v_pid,'Crane','CR-003','SN-MC-33109','80 tonnes','2026-08-10','Valid','Good',TRUE,v_uid),
    (v_pid,'Forklift','FL-001','SN-FL-78234','5 tonnes','2026-05-01','Valid','Good',TRUE,v_uid),
    (v_pid,'Forklift','FL-002','SN-FL-78235','3 tonnes','2026-03-25','Expiring','Good',TRUE,v_uid),
    (v_pid,'Forklift','FL-003','SN-FL-78301','5 tonnes','2026-07-12','Valid','Fair',TRUE,v_uid),
    (v_pid,'Excavator','EX-001','SN-EX-90112','N/A','2026-09-30','Valid','Good',TRUE,v_uid),
    (v_pid,'Excavator','EX-002','SN-EX-90113','N/A','2026-05-15','Valid','Good',TRUE,v_uid),
    (v_pid,'Excavator','EX-003','SN-EX-90200','N/A','2025-12-01','Expired','Fair',FALSE,v_uid),
    (v_pid,'Generator','GN-001','SN-GN-55001','500 kVA','2026-11-20','Valid','Good',TRUE,v_uid),
    (v_pid,'Generator','GN-002','SN-GN-55002','250 kVA','2026-08-15','Valid','Good',TRUE,v_uid),
    (v_pid,'Generator','GN-003','SN-GN-55003','100 kVA','2026-04-10','Valid','Fair',TRUE,v_uid),
    (v_pid,'Compressor','CP-001','SN-CP-12001','10 bar','2026-06-30','Valid','Good',TRUE,v_uid),
    (v_pid,'Compressor','CP-002','SN-CP-12002','7 bar','2026-03-15','Expiring','Good',TRUE,v_uid),
    (v_pid,'Scaffolding','SC-001','SN-SC-SET01','N/A','2026-12-31','Valid','Good',TRUE,v_uid),
    (v_pid,'Scaffolding','SC-002','SN-SC-SET02','N/A','2026-12-31','Valid','Good',TRUE,v_uid),
    (v_pid,'Pump','PM-001','SN-PM-33401','200 m3/hr','2026-07-20','Valid','Good',TRUE,v_uid),
    (v_pid,'Pump','PM-002','SN-PM-33402','150 m3/hr','2026-05-10','Valid','Fair',TRUE,v_uid),
    (v_pid,'Welding Machine','WM-001','SN-WM-22101','400A','2026-09-15','Valid','Good',TRUE,v_uid),
    (v_pid,'Welding Machine','WM-002','SN-WM-22102','300A','2026-06-01','Valid','Good',TRUE,v_uid),
    (v_pid,'Welding Machine','WM-003','SN-WM-22103','300A','2026-03-20','Expiring','Fair',TRUE,v_uid),
    (v_pid,'Ladder','LD-001','SN-LD-10001','150 kg','2026-12-31','Valid','Good',TRUE,v_uid),
    (v_pid,'Ladder','LD-002','SN-LD-10002','150 kg','2026-12-31','Valid','Good',TRUE,v_uid),
    (v_pid,'Cherry Picker','CP-001','SN-AP-66701','225 kg','2026-08-30','Valid','Good',TRUE,v_uid),
    (v_pid,'Cherry Picker','CP-002','SN-AP-66702','200 kg','2026-04-15','Valid','Good',TRUE,v_uid),
    (v_pid,'Other','BL-001','SN-BL-44401','N/A','2026-10-10','Valid','Good',TRUE,v_uid),
    (v_pid,'Other','MC-001','SN-MC-55501','2 tonne','2026-05-20','Valid','Good',TRUE,v_uid),
    (v_pid,'Other','VP-001','SN-VP-77701','N/A','2025-11-15','Expired','Poor',FALSE,v_uid);

  -- =====================================================
  -- 17. INCIDENTS (18 records)
  -- =====================================================
  INSERT INTO incidents (project_id, incident_date, severity, description, location, investigation_status, capa_status, verified, created_by)
  VALUES
    (v_pid,'2025-01-14','Near-Miss','Unsecured load shifted during crane lift. No injuries. Rigging procedure reviewed.','Zone A - Piling Area','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-01-28','First Aid','Worker sustained minor cut while cutting rebar. First aid administered on site.','Zone B - Rebar Yard','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-02-11','Near-Miss','Scaffolding plank dislodged by wind. Area was cordoned. Wind speed protocols reinforced.','Zone B - Level 3','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-02-22','First Aid','Bee sting incident during outdoor works. Antihistamine administered.','Zone C - Landscaping','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-03-08','Near-Miss','Forklift reversed into barricade. No personnel nearby. Spotter requirement enforced.','Material Laydown','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-03-25','MTI','Worker twisted ankle stepping off elevated platform. Sent to clinic. Light duty 3 days.','Zone A - Platform','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-04-15','Near-Miss','Dropped hand tool from height (2m). Exclusion zone was in place. Tool tether mandate issued.','Zone D - Facade','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-05-03','First Aid','Heat-related dizziness. Worker hydrated and rested. Cooling schedule adjusted.','Zone C - Open Area','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-05-20','Near-Miss','Electrical arc flash near temporary panel. No injuries. Lockout procedure enhanced.','Generator Compound','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-06-10','First Aid','Minor burn from welding spatter. PPE was worn but sleeve gap found. PPE fit-check added.','Workshop','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-07-02','Near-Miss','Excavation wall showed signs of instability. Work stopped immediately. Shoring reinforced.','Zone A - Foundation','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-07-18','Near-Miss','Vehicle near-miss at intersection. Speed limit reduced. Speed bumps installed.','Site Access Road','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-08-12','First Aid','Splinter from timber formwork. First aid administered.','Zone B - Formwork','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-09-05','Near-Miss','Crane load indicator alarm triggered during lift. Operation paused and re-planned.','Zone A - Marine Deck','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-10-22','Near-Miss','Chemical container found unlabelled in storage. SDS updated and labelling audit done.','Chemical Store','Completed','Closed',TRUE,v_uid),
    (v_pid,'2025-11-15','First Aid','Paper cut in site office during document review. First aid kit used.','Main Office','Completed','Closed',TRUE,v_uid),
    (v_pid,'2026-01-10','Near-Miss','Loose handrail on temporary staircase identified during inspection. Immediately repaired.','Zone C - Stairwell','Completed','In Progress',TRUE,v_uid),
    (v_pid,'2026-02-08','Near-Miss','Delivery truck arrived without proper documentation. Turned away at gate. Procedure working.','Main Gate','In Progress','Open',FALSE,v_uid);

  -- =====================================================
  -- 18. SUBCONTRACTORS (6 companies, quarterly data)
  -- =====================================================
  INSERT INTO subcontractors (project_id, name, trade, year, quarter, workers, induction_pct, training_pct, audit_score_pct, ptw_compliance_pct, overall_score, rag_status)
  VALUES
    -- Q1 2025
    (v_pid,'Al Rashid Trading & Contracting','Civil & Structural',2025,1,120,95,88,82,90,88.75,'green'),
    (v_pid,'Nesma & Partners','Structural Steel',2025,1,65,92,85,78,88,85.75,'green'),
    (v_pid,'Al Bawani Company','MEP & Electrical',2025,1,80,90,82,75,85,83.00,'amber'),
    (v_pid,'Al Khodari Sons','Earthworks',2025,1,45,88,80,72,82,80.50,'amber'),
    (v_pid,'Arabian Bemco Contracting','Mechanical',2025,1,55,91,84,80,87,85.50,'green'),
    (v_pid,'STRABAG','Marine Works',2025,1,90,94,90,85,92,90.25,'green'),
    -- Q2 2025
    (v_pid,'Al Rashid Trading & Contracting','Civil & Structural',2025,2,140,97,91,86,93,91.75,'green'),
    (v_pid,'Nesma & Partners','Structural Steel',2025,2,75,95,88,82,91,89.00,'green'),
    (v_pid,'Al Bawani Company','MEP & Electrical',2025,2,95,93,86,80,89,87.00,'green'),
    (v_pid,'Al Khodari Sons','Earthworks',2025,2,50,92,84,78,86,85.00,'green'),
    (v_pid,'Arabian Bemco Contracting','Mechanical',2025,2,65,94,88,84,90,89.00,'green'),
    (v_pid,'STRABAG','Marine Works',2025,2,100,96,92,88,94,92.50,'green'),
    -- Q3 2025
    (v_pid,'Al Rashid Trading & Contracting','Civil & Structural',2025,3,160,98,94,90,96,94.50,'green'),
    (v_pid,'Nesma & Partners','Structural Steel',2025,3,85,97,91,86,94,92.00,'green'),
    (v_pid,'Al Bawani Company','MEP & Electrical',2025,3,110,96,90,85,92,90.75,'green'),
    (v_pid,'Al Khodari Sons','Earthworks',2025,3,40,95,88,82,90,88.75,'green'),
    (v_pid,'Arabian Bemco Contracting','Mechanical',2025,3,70,96,92,88,93,92.25,'green'),
    (v_pid,'STRABAG','Marine Works',2025,3,95,98,95,92,96,95.25,'green'),
    -- Q4 2025
    (v_pid,'Al Rashid Trading & Contracting','Civil & Structural',2025,4,150,100,96,93,98,96.75,'green'),
    (v_pid,'Nesma & Partners','Structural Steel',2025,4,70,99,94,90,96,94.75,'green'),
    (v_pid,'Al Bawani Company','MEP & Electrical',2025,4,120,98,93,88,95,93.50,'green'),
    (v_pid,'Al Khodari Sons','Earthworks',2025,4,30,97,92,86,93,92.00,'green'),
    (v_pid,'Arabian Bemco Contracting','Mechanical',2025,4,75,98,95,91,95,94.75,'green'),
    (v_pid,'STRABAG','Marine Works',2025,4,85,100,97,95,98,97.50,'green');

  -- =====================================================
  -- 19. MANPOWER MONTHLY (Jan 2025 - Feb 2026)
  -- =====================================================
  INSERT INTO manpower_monthly (project_id, year, month, headcount, manhours, ot_hours, ot_percentage)
  VALUES
    (v_pid,2025,1,150,31200,4368,14.0),
    (v_pid,2025,2,175,36400,4732,13.0),
    (v_pid,2025,3,210,43680,5242,12.0),
    (v_pid,2025,4,245,50960,5606,11.0),
    (v_pid,2025,5,280,58240,5824,10.0),
    (v_pid,2025,6,320,66560,5990,9.0),
    (v_pid,2025,7,350,72800,7280,10.0),
    (v_pid,2025,8,385,80080,6406,8.0),
    (v_pid,2025,9,420,87360,7863,9.0),
    (v_pid,2025,10,455,94640,7571,8.0),
    (v_pid,2025,11,480,99840,6989,7.0),
    (v_pid,2025,12,500,104000,8320,8.0),
    (v_pid,2026,1,520,108160,7571,7.0),
    (v_pid,2026,2,540,112320,7862,7.0);

  -- =====================================================
  -- 20. DOCUMENTS (24 records)
  -- =====================================================
  INSERT INTO documents (project_id, doc_type, name, holder, issue_date, expiry_date, status, flag, created_by)
  VALUES
    (v_pid,'Permit','Construction Permit - Zone A','Local Authority','2024-06-01','2026-06-01','Valid','None',v_uid),
    (v_pid,'Permit','Construction Permit - Zone B','Local Authority','2024-06-01','2026-06-01','Valid','None',v_uid),
    (v_pid,'Permit','Environmental Permit','NCEC','2024-05-15','2026-05-15','Valid','None',v_uid),
    (v_pid,'Permit','Marine Works Permit','Local Authority','2024-07-01','2026-07-01','Valid','None',v_uid),
    (v_pid,'Insurance','Public Liability Insurance','AXA Cooperative','2025-01-01','2026-01-01','Expired','Critical',v_uid),
    (v_pid,'Insurance','Employers Liability Insurance','Tawuniya','2025-01-01','2026-06-30','Valid','None',v_uid),
    (v_pid,'Insurance','Professional Indemnity','BUPA Arabia','2025-01-01','2026-06-30','Valid','None',v_uid),
    (v_pid,'Insurance','Equipment All Risk','AXA Cooperative','2025-01-01','2026-03-31','Expiring','Warning',v_uid),
    (v_pid,'Certificate','ISO 45001 - OHS Management','TUV SUD','2024-09-01','2027-09-01','Valid','None',v_uid),
    (v_pid,'Certificate','ISO 14001 - Environmental','TUV SUD','2024-09-01','2027-09-01','Valid','None',v_uid),
    (v_pid,'Certificate','ISO 9001 - Quality','Bureau Veritas','2024-08-15','2027-08-15','Valid','None',v_uid),
    (v_pid,'License','Crane Operating License','Saudi GOSI','2025-03-01','2026-03-01','Expiring','Warning',v_uid),
    (v_pid,'License','Electrical Work License','ECRA','2025-04-01','2026-04-01','Valid','None',v_uid),
    (v_pid,'License','Waste Transport License','NCEC','2025-02-01','2026-02-01','Expired','Critical',v_uid),
    (v_pid,'Method Statement','Piling Works MS','Al Rashid Contracting','2024-12-01',NULL,'Valid','None',v_uid),
    (v_pid,'Method Statement','Steel Erection MS','Nesma & Partners','2025-01-15',NULL,'Valid','None',v_uid),
    (v_pid,'Method Statement','Marine Concrete MS','STRABAG','2025-02-01',NULL,'Valid','None',v_uid),
    (v_pid,'Risk Assessment','Project Risk Register','Eltizam EHSS','2024-11-01',NULL,'Valid','None',v_uid),
    (v_pid,'Risk Assessment','Marine Works RA','STRABAG','2025-01-10',NULL,'Valid','None',v_uid),
    (v_pid,'Risk Assessment','Working at Height RA','Eltizam EHSS','2025-01-15',NULL,'Valid','None',v_uid),
    (v_pid,'Inspection Report','Q3 2025 Audit Report','Eltizam EHSS','2025-10-01',NULL,'Valid','None',v_uid),
    (v_pid,'Inspection Report','Q4 2025 Audit Report','Eltizam EHSS','2026-01-10',NULL,'Valid','None',v_uid),
    (v_pid,'Training Certificate','First Aid Batch Certificate','Red Crescent','2025-06-01','2026-06-01','Valid','None',v_uid),
    (v_pid,'Training Certificate','Fire Warden Batch Certificate','Civil Defense','2025-05-15','2026-05-15','Valid','None',v_uid);

  -- =====================================================
  -- 21. DASHBOARD TREND CODES (legacy codes)
  -- =====================================================
  -- The dashboard trend table uses SAF-01, INS-01, etc.
  INSERT INTO kpi_data (project_id, kpi_code, year, month, value, target, rag_status)
  SELECT v_pid, code, y, m, v, NULL, NULL
  FROM (VALUES
    ('SAF-01',2025,1,0.72),('SAF-01',2025,2,0.68),('SAF-01',2025,3,0.61),('SAF-01',2025,4,0.55),
    ('SAF-01',2025,5,0.48),('SAF-01',2025,6,0.45),('SAF-01',2025,7,0.42),('SAF-01',2025,8,0.38),
    ('SAF-01',2025,9,0.35),('SAF-01',2025,10,0.33),('SAF-01',2025,11,0.31),('SAF-01',2025,12,0.28),
    ('SAF-02',2025,1,0.35),('SAF-02',2025,2,0.32),('SAF-02',2025,3,0.28),('SAF-02',2025,4,0.25),
    ('SAF-02',2025,5,0.22),('SAF-02',2025,6,0.20),('SAF-02',2025,7,0.18),('SAF-02',2025,8,0.15),
    ('SAF-02',2025,9,0.14),('SAF-02',2025,10,0.12),('SAF-02',2025,11,0.10),('SAF-02',2025,12,0.08),
    ('SAF-03',2025,1,0),('SAF-03',2025,2,0),('SAF-03',2025,3,0),('SAF-03',2025,4,0),
    ('SAF-03',2025,5,0),('SAF-03',2025,6,0),('SAF-03',2025,7,0),('SAF-03',2025,8,0),
    ('SAF-03',2025,9,0),('SAF-03',2025,10,0),('SAF-03',2025,11,0),('SAF-03',2025,12,0),
    ('SAF-05',2025,1,31200),('SAF-05',2025,2,36400),('SAF-05',2025,3,43680),('SAF-05',2025,4,50960),
    ('SAF-05',2025,5,58240),('SAF-05',2025,6,66560),('SAF-05',2025,7,72800),('SAF-05',2025,8,80080),
    ('SAF-05',2025,9,87360),('SAF-05',2025,10,94640),('SAF-05',2025,11,99840),('SAF-05',2025,12,104000),
    ('INS-01',2025,1,14),('INS-01',2025,2,16),('INS-01',2025,3,18),('INS-01',2025,4,19),
    ('INS-01',2025,5,21),('INS-01',2025,6,22),('INS-01',2025,7,23),('INS-01',2025,8,24),
    ('INS-01',2025,9,25),('INS-01',2025,10,24),('INS-01',2025,11,26),('INS-01',2025,12,25),
    ('TRN-01',2025,1,92),('TRN-01',2025,2,94),('TRN-01',2025,3,95),('TRN-01',2025,4,96),
    ('TRN-01',2025,5,97),('TRN-01',2025,6,98),('TRN-01',2025,7,98),('TRN-01',2025,8,99),
    ('TRN-01',2025,9,100),('TRN-01',2025,10,100),('TRN-01',2025,11,100),('TRN-01',2025,12,100),
    ('INS-03',2025,1,82),('INS-03',2025,2,84),('INS-03',2025,3,86),('INS-03',2025,4,88),
    ('INS-03',2025,5,90),('INS-03',2025,6,91),('INS-03',2025,7,93),('INS-03',2025,8,94),
    ('INS-03',2025,9,95),('INS-03',2025,10,96),('INS-03',2025,11,97),('INS-03',2025,12,98),
    ('ENV-01',2025,1,2),('ENV-01',2025,2,1),('ENV-01',2025,3,1),('ENV-01',2025,4,2),
    ('ENV-01',2025,5,0),('ENV-01',2025,6,1),('ENV-01',2025,7,0),('ENV-01',2025,8,0),
    ('ENV-01',2025,9,1),('ENV-01',2025,10,0),('ENV-01',2025,11,0),('ENV-01',2025,12,0)
  ) AS t(code,y,m,v);

  RAISE NOTICE 'Mock data loaded successfully for project: Marina & Yacht Club (ID: %)', v_pid;
END $$;
