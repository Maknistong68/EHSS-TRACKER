'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { createClient } from '@/lib/supabase/client';
import YearTabs from '@/components/shared/year-tabs';
import { getMonthName } from '@/lib/utils/dates';
import { checkOvertimeCompliance } from '@/lib/utils/compliance';
import { cn } from '@/lib/utils';

interface ManpowerRow {
  id?: string;
  month: number;
  headcount: number;
  manhours: number;
  ot_hours: number;
  ot_percentage: number;
}

export default function ManpowerPage() {
  const { currentProject } = useProject();
  const supabase = createClient();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [data, setData] = useState<ManpowerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from('manpower_monthly')
      .select('*')
      .eq('project_id', currentProject.id)
      .eq('year', selectedYear)
      .order('month');

    const monthData: ManpowerRow[] = Array.from({ length: 12 }, (_, i) => {
      const existing = rows?.find((r) => r.month === i + 1);
      return existing || { month: i + 1, headcount: 0, manhours: 0, ot_hours: 0, ot_percentage: 0 };
    });
    setData(monthData);
    setLoading(false);
  }, [currentProject, selectedYear, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChange = async (month: number, field: string, value: number) => {
    if (!currentProject) return;
    setSaving(true);

    const row = data.find((r) => r.month === month)!;
    const updated = { ...row, [field]: value };
    if (field === 'ot_hours' || field === 'manhours') {
      updated.ot_percentage = updated.manhours > 0 ? Math.round((updated.ot_hours / updated.manhours) * 1000) / 10 : 0;
    }

    await supabase.from('manpower_monthly').upsert({
      project_id: currentProject.id,
      year: selectedYear,
      month,
      headcount: updated.headcount,
      manhours: updated.manhours,
      ot_hours: updated.ot_hours,
      ot_percentage: updated.ot_percentage,
    }, { onConflict: 'project_id,year,month' });

    setData((prev) => prev.map((r) => r.month === month ? updated : r));
    setSaving(false);
  };

  const totals = data.reduce(
    (acc, r) => ({
      headcount: acc.headcount + r.headcount,
      manhours: acc.manhours + r.manhours,
      ot_hours: acc.ot_hours + r.ot_hours,
    }),
    { headcount: 0, manhours: 0, ot_hours: 0 }
  );
  const avgHeadcount = Math.round(totals.headcount / 12);
  const totalOtPct = totals.manhours > 0 ? Math.round((totals.ot_hours / totals.manhours) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manpower Tracker</h1>
          <p className="text-sm text-gray-500">Monthly headcount, manhours, and overtime tracking</p>
        </div>
        <YearTabs startYear={2024} selectedYear={selectedYear} onYearChange={setSelectedYear} />
      </div>

      {saving && <div className="text-xs text-primary-600">Saving...</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading manpower data...</div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Month</th>
                <th className="table-header text-center">Headcount</th>
                <th className="table-header text-center">Manhours</th>
                <th className="table-header text-center">OT Hours</th>
                <th className="table-header text-center">OT %</th>
                <th className="table-header text-center">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const otCompliance = checkOvertimeCompliance(row.ot_percentage);
                return (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{getMonthName(row.month)}</td>
                    <td className="table-cell p-1">
                      <input
                        type="number"
                        value={row.headcount || ''}
                        onChange={(e) => handleChange(row.month, 'headcount', Number(e.target.value))}
                        className="w-full rounded border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-primary-400 focus:outline-none"
                        min={0}
                      />
                    </td>
                    <td className="table-cell p-1">
                      <input
                        type="number"
                        value={row.manhours || ''}
                        onChange={(e) => handleChange(row.month, 'manhours', Number(e.target.value))}
                        className="w-full rounded border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-primary-400 focus:outline-none"
                        min={0}
                      />
                    </td>
                    <td className="table-cell p-1">
                      <input
                        type="number"
                        value={row.ot_hours || ''}
                        onChange={(e) => handleChange(row.month, 'ot_hours', Number(e.target.value))}
                        className="w-full rounded border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-primary-400 focus:outline-none"
                        min={0}
                      />
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(
                        'font-medium',
                        row.ot_percentage > 10 ? 'text-red-600' : row.ot_percentage > 8 ? 'text-amber-600' : 'text-green-600'
                      )}>
                        {row.ot_percentage}%
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        otCompliance.severity === 'success' ? 'bg-green-100 text-green-700' :
                        otCompliance.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      )}>
                        {otCompliance.compliant ? 'OK' : 'Alert'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="bg-gray-50 font-semibold">
                <td className="table-cell">Total / Average</td>
                <td className="table-cell text-center">{avgHeadcount} avg</td>
                <td className="table-cell text-center">{totals.manhours.toLocaleString()}</td>
                <td className="table-cell text-center">{totals.ot_hours.toLocaleString()}</td>
                <td className="table-cell text-center">{totalOtPct}%</td>
                <td className="table-cell text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
