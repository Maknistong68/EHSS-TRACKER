'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { createClient } from '@/lib/supabase/client';
import { KPI_DEFINITIONS, KPI_CATEGORIES } from '@/lib/constants/kpis';
import RagBadge from '@/components/shared/rag-badge';
import { calculateRag } from '@/lib/utils/rag';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnnualSummaryPage() {
  const { currentProject } = useProject();
  const supabase = createClient();
  const startYear = 2024;
  const [yearlyData, setYearlyData] = useState<Record<string, Record<number, number | null>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);

    const { data } = await supabase
      .from('kpi_data')
      .select('kpi_code, year, month, value')
      .eq('project_id', currentProject.id);

    // Aggregate: average monthly values per KPI per year
    const grouped: Record<string, Record<number, number[]>> = {};
    data?.forEach((row) => {
      if (row.value === null) return;
      if (!grouped[row.kpi_code]) grouped[row.kpi_code] = {};
      if (!grouped[row.kpi_code][row.year]) grouped[row.kpi_code][row.year] = [];
      grouped[row.kpi_code][row.year].push(Number(row.value));
    });

    const result: Record<string, Record<number, number | null>> = {};
    Object.entries(grouped).forEach(([code, years]) => {
      result[code] = {};
      Object.entries(years).forEach(([year, values]) => {
        result[code][Number(year)] = values.length > 0
          ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
          : null;
      });
    });
    setYearlyData(result);
    setLoading(false);
  }, [currentProject, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredKpis = selectedCategory
    ? KPI_DEFINITIONS.filter((k) => k.category === selectedCategory)
    : KPI_DEFINITIONS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Annual Summary</h1>
        <p className="text-sm text-gray-500">5-year KPI summary with trend indicators across all 72 KPIs</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            !selectedCategory ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          All Categories
        </button>
        {KPI_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              selectedCategory === cat ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading annual summary...</div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header sticky left-0 bg-gray-50 z-10 min-w-[50px]">Code</th>
                <th className="table-header sticky left-[50px] bg-gray-50 z-10 min-w-[200px]">KPI</th>
                <th className="table-header text-center">Target</th>
                {Array.from({ length: 5 }, (_, i) => (
                  <th key={i} className="table-header text-center">Y{i + 1} ({startYear + i})</th>
                ))}
                <th className="table-header text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {filteredKpis.map((kpi) => {
                const values = Array.from({ length: 5 }, (_, i) => yearlyData[kpi.code]?.[startYear + i] ?? null);
                const nonNull = values.filter((v): v is number => v !== null);
                const trend = nonNull.length >= 2 ? nonNull[nonNull.length - 1] - nonNull[nonNull.length - 2] : 0;

                return (
                  <tr key={kpi.code} className="hover:bg-gray-50">
                    <td className="table-cell text-xs font-mono text-gray-400 sticky left-0 bg-white z-10">
                      {kpi.code.split('-').pop()}
                    </td>
                    <td className="table-cell font-medium sticky left-[50px] bg-white z-10 min-w-[200px]">
                      <div>
                        <span className="text-sm">{kpi.name}</span>
                        <span className="block text-[10px] text-gray-400">{kpi.category}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center text-xs">
                      {kpi.target !== null ? `${kpi.target}${kpi.unit === '%' ? '%' : ''}` : '-'}
                    </td>
                    {values.map((val, i) => {
                      const rag = val !== null ? calculateRag(val, {
                        target: kpi.target,
                        redThreshold: kpi.redThreshold,
                        amberThreshold: kpi.amberThreshold,
                      }) : 'none';
                      return (
                        <td key={i} className="table-cell text-center">
                          {val !== null ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm">{val}</span>
                              <RagBadge status={rag} size="sm" />
                            </div>
                          ) : '-'}
                        </td>
                      );
                    })}
                    <td className="table-cell text-center">
                      {trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-amber-500 mx-auto" />
                      ) : trend < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
