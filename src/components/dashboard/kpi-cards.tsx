'use client';

import { ShieldCheck, Skull, AlertTriangle, Clock, Search, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; direction: 'up' | 'down' };
  color: string;
  bgColor: string;
}

interface KpiCardsProps {
  data?: {
    compliancePct: number;
    fatalities: number;
    ltiCount: number;
    totalManhours: number;
    inspections: number;
    incidents: number;
  };
}

export default function KpiCards({ data }: KpiCardsProps) {
  const cards: KpiCardData[] = [
    {
      label: 'EHSS Compliance',
      value: data ? `${data.compliancePct}%` : '-',
      icon: ShieldCheck,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Fatalities',
      value: data?.fatalities ?? 0,
      icon: Skull,
      color: data?.fatalities ? 'text-red-700' : 'text-green-700',
      bgColor: data?.fatalities ? 'bg-red-100' : 'bg-green-100',
    },
    {
      label: 'Lost Time Injuries',
      value: data?.ltiCount ?? 0,
      icon: AlertTriangle,
      color: data?.ltiCount ? 'text-amber-700' : 'text-green-700',
      bgColor: data?.ltiCount ? 'bg-amber-100' : 'bg-green-100',
    },
    {
      label: 'Total Manhours',
      value: data ? data.totalManhours.toLocaleString() : '-',
      icon: Clock,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Inspections',
      value: data?.inspections ?? 0,
      icon: Search,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Incidents This Month',
      value: data?.incidents ?? 0,
      icon: Flame,
      color: data?.incidents ? 'text-red-700' : 'text-green-700',
      bgColor: data?.incidents ? 'bg-red-100' : 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="card">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', card.bgColor)}>
              <card.icon className={cn('h-5 w-5', card.color)} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
