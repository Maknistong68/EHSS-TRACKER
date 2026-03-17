'use client';

import { useEffect, useState } from 'react';
import { Thermometer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHeatStressAlert } from '@/lib/utils/compliance';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  icon: React.ElementType;
  message: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Check heat stress
    const heatAlert = getHeatStressAlert();
    if (heatAlert.active) {
      newAlerts.push({
        id: 'heat-stress',
        type: heatAlert.severity === 'critical' ? 'critical' : 'warning',
        icon: Thermometer,
        message: heatAlert.message,
      });
    }

    // Placeholder alerts - in production these come from DB queries
    newAlerts.push({
      id: 'overdue-inspections',
      type: 'warning',
      icon: Clock,
      message: 'Review scheduled inspections for the current month',
    });

    setAlerts(newAlerts);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-3',
            alert.type === 'critical' && 'bg-red-50 border-red-200',
            alert.type === 'warning' && 'bg-amber-50 border-amber-200',
            alert.type === 'info' && 'bg-blue-50 border-blue-200'
          )}
        >
          <alert.icon className={cn(
            'h-5 w-5 flex-shrink-0 mt-0.5',
            alert.type === 'critical' && 'text-red-600',
            alert.type === 'warning' && 'text-amber-600',
            alert.type === 'info' && 'text-blue-600'
          )} />
          <p className={cn(
            'text-sm',
            alert.type === 'critical' && 'text-red-800',
            alert.type === 'warning' && 'text-amber-800',
            alert.type === 'info' && 'text-blue-800'
          )}>
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
}
