'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import { KPI_DEFINITIONS, KPI_CATEGORIES } from '@/lib/constants/kpis';
import YearTabs from '@/components/shared/year-tabs';
import { calculateRag, type RagStatus } from '@/lib/utils/rag';
import { getMonthName } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

interface KpiValue {
  kpi_code: string;
  month: number;
  value: number | null;
  target: number | null;
  rag_status: RagStatus | null;
}

export default function KpiPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedCategory, setSelectedCategory] = useState<string>(KPI_CATEGORIES[0]);
  const [kpiValues, setKpiValues] = useState<Record<string, Record<number, KpiValue>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounce timers per cell
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('kpi_data')
      .select('kpi_code, month, value, target, rag_status')
      .eq('project_id', currentProject.id)
      .eq('year', selectedYear);

    if (error) {
      toast('error', 'Failed to load KPI data: ' + error.message);
      setLoading(false);
      return;
    }

    const grouped: Record<string, Record<number, KpiValue>> = {};
    data?.forEach((row) => {
      if (!grouped[row.kpi_code]) grouped[row.kpi_code] = {};
      grouped[row.kpi_code][row.month] = row;
    });
    setKpiValues(grouped);
    setLoading(false);
  }, [currentProject, selectedYear, supabase, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveValue = useCallback(async (kpiCode: string, month: number, numValue: number | null) => {
    if (!currentProject) return;
    setSaving(true);

    const kpiDef = KPI_DEFINITIONS.find((k) => k.code === kpiCode);
    const ragStatus = kpiDef && numValue !== null
      ? calculateRag(numValue, {
        target: kpiDef.target,
        redThreshold: kpiDef.redThreshold,
        amberThreshold: kpiDef.amberThreshold,
      })
      : null;

    const { error } = await supabase.from('kpi_data').upsert({
      project_id: currentProject.id,
      kpi_code: kpiCode,
      year: selectedYear,
      month,
      value: numValue,
      target: kpiDef?.target,
      rag_status: ragStatus,
    }, {
      onConflict: 'project_id,kpi_code,year,month',
    });

    if (error) {
      toast('error', 'Failed to save KPI value: ' + error.message);
    }

    // Update local state
    setKpiValues((prev) => ({
      ...prev,
      [kpiCode]: {
        ...prev[kpiCode],
        [month]: { kpi_code: kpiCode, month, value: numValue, target: kpiDef?.target || null, rag_status: ragStatus },
      },
    }));

    setSaving(false);
  }, [currentProject, selectedYear, supabase, toast]);

  const handleValueChange = useCallback((kpiCode: string, month: number, value: string) => {
    const numValue = value === '' ? null : Number(value);

    // Immediately update local state for responsive UI
    const kpiDef = KPI_DEFINITIONS.find((k) => k.code === kpiCode);
    const ragStatus = kpiDef && numValue !== null
      ? calculateRag(numValue, {
        target: kpiDef.target,
        redThreshold: kpiDef.redThreshold,
        amberThreshold: kpiDef.amberThreshold,
      })
      : null;

    setKpiValues((prev) => ({
      ...prev,
      [kpiCode]: {
        ...prev[kpiCode],
        [month]: { kpi_code: kpiCode, month, value: numValue, target: kpiDef?.target || null, rag_status: ragStatus },
      },
    }));

    // Debounce the actual DB save (500ms)
    const timerKey = `${kpiCode}-${month}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }
    debounceTimers.current[timerKey] = setTimeout(() => {
      saveValue(kpiCode, month, numValue);
      delete debounceTimers.current[timerKey];
    }, 500);
  }, [saveValue]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  const categoryKpis = KPI_DEFINITIONS.filter((k) => k.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Tracker</h1>
          <p className="text-sm text-gray-500">72 KPIs across 10 categories with NEOM references</p>
        </div>
        <YearTabs
          startYear={currentProject?.start_year || 2024}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="KPI categories">
        {KPI_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            role="tab"
            aria-selected={selectedCategory === cat}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {saving && (
        <div className="text-xs text-primary-600">Saving...</div>
      )}

      {/* KPI Grid */}
      {loading ? (
        <TableSkeleton rows={8} cols={15} />
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header sticky left-0 bg-gray-50 z-10 min-w-[200px]">KPI</th>
                <th className="table-header text-center w-16">Code</th>
                <th className="table-header text-center w-16">Target</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i} className="table-header text-center w-20">{getMonthName(i + 1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryKpis.map((kpi) => (
                <tr key={kpi.code} className="hover:bg-gray-50">
                  <td className="table-cell font-medium sticky left-0 bg-white z-10 min-w-[200px]">
                    {kpi.name}
                  </td>
                  <td className="table-cell text-center text-xs text-gray-400 font-mono">
                    {kpi.code.split('-').pop()}
                  </td>
                  <td className="table-cell text-center text-xs">
                    {kpi.target !== null ? kpi.target : '-'}
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const cellData = kpiValues[kpi.code]?.[month];
                    const ragStatus = cellData?.rag_status || 'none';
                    const ragBg = ragStatus === 'green' ? 'bg-green-50' : ragStatus === 'amber' ? 'bg-amber-50' : ragStatus === 'red' ? 'bg-red-50' : '';

                    return (
                      <td key={month} className={cn('table-cell p-1', ragBg)}>
                        <input
                          type="number"
                          defaultValue={cellData?.value ?? ''}
                          onChange={(e) => handleValueChange(kpi.code, month, e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-center text-xs focus:border-primary-400 focus:outline-none"
                          placeholder="-"
                          aria-label={`${kpi.name} - ${getMonthName(month)}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
