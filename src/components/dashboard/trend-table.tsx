'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  kpi: string;
  values: (number | null)[];
}

interface TrendTableProps {
  data?: TrendData[];
  startYear?: number;
}

const defaultData: TrendData[] = [
  { kpi: 'TRIR', values: [null, null, null, null, null] },
  { kpi: 'LTIFR', values: [null, null, null, null, null] },
  { kpi: 'Fatalities', values: [null, null, null, null, null] },
  { kpi: 'Total Manhours', values: [null, null, null, null, null] },
  { kpi: 'Inspections', values: [null, null, null, null, null] },
  { kpi: 'Training Compliance %', values: [null, null, null, null, null] },
  { kpi: 'NCR Closure Rate %', values: [null, null, null, null, null] },
  { kpi: 'Environmental Incidents', values: [null, null, null, null, null] },
];

export default function TrendTable({ data = defaultData, startYear = 2024 }: TrendTableProps) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Trend Summary</h3>
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">KPI</th>
              {Array.from({ length: 5 }, (_, i) => (
                <th key={i} className="table-header text-center">Y{i + 1} ({startYear + i})</th>
              ))}
              <th className="table-header text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const lastTwo = row.values.filter((v) => v !== null);
              const trend = lastTwo.length >= 2
                ? lastTwo[lastTwo.length - 1]! - lastTwo[lastTwo.length - 2]!
                : 0;

              return (
                <tr key={row.kpi}>
                  <td className="table-cell font-medium">{row.kpi}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="table-cell text-center">
                      {val !== null ? val.toLocaleString() : '-'}
                    </td>
                  ))}
                  <td className="table-cell text-center">
                    {trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mx-auto" />
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
    </div>
  );
}
