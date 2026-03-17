'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import KpiCards from '@/components/dashboard/kpi-cards';
import PhaseProgress from '@/components/dashboard/phase-progress';
import Alerts from '@/components/dashboard/alerts';
import TrendTable from '@/components/dashboard/trend-table';
import { DashboardSkeleton } from '@/components/shared/loading-skeleton';

export default function DashboardPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState({ premob: 0, mob: 0, execution: 0, demob: 0 });
  const [kpiSummary, setKpiSummary] = useState({
    compliancePct: 0,
    fatalities: 0,
    ltiCount: 0,
    manhours: 0,
    inspections: 0,
    incidents: 0,
  });
  const [trendData, setTrendData] = useState<{ kpi: string; values: (number | null)[] }[]>([]);

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);

    try {
      // Load all data concurrently
      const [premobRes, mobRes, demobRes, incidentsRes, inspectionsRes, manpowerRes, kpiRes] = await Promise.all([
        supabase.from('premob_checklist').select('completed').eq('project_id', currentProject.id),
        supabase.from('mob_checklist').select('completed').eq('project_id', currentProject.id),
        supabase.from('demob_checklist').select('completed').eq('project_id', currentProject.id),
        supabase.from('incidents').select('severity').eq('project_id', currentProject.id),
        supabase.from('inspections').select('id').eq('project_id', currentProject.id),
        supabase.from('manpower_monthly').select('manhours').eq('project_id', currentProject.id),
        supabase.from('kpi_data').select('kpi_code, year, value').eq('project_id', currentProject.id),
      ]);

      // Check for errors
      const errs = [premobRes, mobRes, demobRes, incidentsRes, inspectionsRes, manpowerRes, kpiRes].filter((r) => r.error);
      if (errs.length > 0) {
        toast('error', 'Some dashboard data failed to load');
      }

      // Calculate phase progress
      const calcPct = (data: { completed: boolean }[] | null) => {
        if (!data || data.length === 0) return 0;
        return Math.round((data.filter((i) => i.completed).length / data.length) * 100);
      };

      const premobPct = calcPct(premobRes.data);
      const mobPct = calcPct(mobRes.data);
      const demobPct = calcPct(demobRes.data);
      const executionPct = premobPct === 100 && mobPct === 100 ? Math.round((premobPct + mobPct) / 2) : Math.round((premobPct + mobPct) / 3);

      setPhases({ premob: premobPct, mob: mobPct, execution: executionPct, demob: demobPct });

      // KPI summary
      const incidents = incidentsRes.data || [];
      const fatalities = incidents.filter((i) => i.severity === 'Fatality').length;
      const ltiCount = incidents.filter((i) => i.severity === 'LTI').length;
      const totalManhours = (manpowerRes.data || []).reduce((sum, m) => sum + (Number(m.manhours) || 0), 0);

      // Calculate compliance from green KPIs
      const allKpiValues = kpiRes.data || [];
      const uniqueKpis = new Set(allKpiValues.map((k) => k.kpi_code));
      const compliancePct = uniqueKpis.size > 0 ? Math.round((uniqueKpis.size / 72) * 100) : 0;

      setKpiSummary({
        compliancePct,
        fatalities,
        ltiCount,
        manhours: totalManhours,
        inspections: (inspectionsRes.data || []).length,
        incidents: incidents.length,
      });

      // Build 5-year trend from KPI data
      const startYear = currentProject.start_year || 2024;
      const trendKpis = ['TRIR', 'LTIFR', 'Fatalities', 'Total Manhours', 'Inspections', 'Training Compliance %', 'NCR Closure Rate %', 'Environmental Incidents'];
      const kpiCodeMap: Record<string, string> = {
        'TRIR': 'SAF-01', 'LTIFR': 'SAF-02', 'Fatalities': 'SAF-03', 'Total Manhours': 'SAF-05',
        'Inspections': 'INS-01', 'Training Compliance %': 'TRN-01', 'NCR Closure Rate %': 'INS-03', 'Environmental Incidents': 'ENV-01',
      };

      const trends = trendKpis.map((kpi) => {
        const code = kpiCodeMap[kpi];
        const values = Array.from({ length: 5 }, (_, yearIdx) => {
          const year = startYear + yearIdx;
          const yearValues = allKpiValues.filter((v) => v.kpi_code === code && v.year === year && v.value !== null);
          if (yearValues.length === 0) return null;
          return yearValues.reduce((sum, v) => sum + Number(v.value), 0) / yearValues.length;
        });
        return { kpi, values };
      });
      setTrendData(trends);
    } catch {
      toast('error', 'Failed to load dashboard data');
    }

    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {currentProject ? `${currentProject.name} — EHSS Overview` : 'Select a project to view dashboard'}
        </p>
      </div>

      <KpiCards
        data={{
          compliancePct: kpiSummary.compliancePct,
          fatalities: kpiSummary.fatalities,
          ltiCount: kpiSummary.ltiCount,
          totalManhours: kpiSummary.manhours,
          inspections: kpiSummary.inspections,
          incidents: kpiSummary.incidents,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <PhaseProgress
            premob={phases.premob}
            mob={phases.mob}
            execution={phases.execution}
            demob={phases.demob}
          />
          <Alerts />
        </div>
        <div className="lg:col-span-2">
          <TrendTable data={trendData} startYear={currentProject?.start_year || 2024} />
        </div>
      </div>
    </div>
  );
}
