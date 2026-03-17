'use client';

import { cn } from '@/lib/utils';

interface YearTabsProps {
  startYear: number;
  selectedYear: number;
  onYearChange: (year: number) => void;
  totalYears?: number;
}

export default function YearTabs({ startYear, selectedYear, onYearChange, totalYears = 5 }: YearTabsProps) {
  const years = Array.from({ length: totalYears }, (_, i) => startYear + i);

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {years.map((year, idx) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            selectedYear === year
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Y{idx + 1} ({year})
        </button>
      ))}
    </div>
  );
}
