'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Database, Clock, Thermometer } from 'lucide-react';
import { WORKING_HOURS, isApproximatelyRamadan, getHeatStressAlert } from '@/lib/utils/compliance';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const supabase = createClient();
  const [auditLogs, setAuditLogs] = useState<{ id: string; created_at: string; user_id: string; action: string; table_name: string; record_id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditLog() {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setAuditLogs(data);
      setLoading(false);
    }
    loadAuditLog();
  }, [supabase]);

  const now = new Date();
  const heatStress = getHeatStressAlert(now);
  const isRamadan = isApproximatelyRamadan(now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings & Compliance</h1>
        <p className="text-sm text-gray-500">System settings, Saudi compliance status, and audit log</p>
      </div>

      {/* Saudi Compliance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-red-100 p-2">
              <Thermometer className="h-5 w-5 text-red-700" />
            </div>
            <h3 className="font-semibold text-gray-900">Heat Stress Status</h3>
          </div>
          <div className={cn(
            'rounded-lg p-3 text-sm',
            heatStress.active
              ? heatStress.severity === 'critical' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
              : 'bg-green-50 text-green-800'
          )}>
            {heatStress.active ? heatStress.message : 'No heat stress restrictions currently active.'}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Restriction period: June 15 - September 15, outdoor work banned 12:00-15:00
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Clock className="h-5 w-5 text-blue-700" />
            </div>
            <h3 className="font-semibold text-gray-900">Working Hours</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className={cn('rounded-lg p-3', isRamadan ? 'bg-purple-50' : 'bg-gray-50')}>
              {isRamadan ? (
                <>
                  <p className="font-medium text-purple-800">Ramadan Hours Active</p>
                  <p className="text-purple-700">{WORKING_HOURS.ramadan.description}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-800">Standard Hours</p>
                  <p className="text-gray-700">{WORKING_HOURS.regular.description}</p>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Overtime threshold: {WORKING_HOURS.overtime.maxPercentage}% of regular hours
            </p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Shield className="h-5 w-5 text-green-700" />
            </div>
            <h3 className="font-semibold text-gray-900">PDPL Compliance</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Data Location</span>
              <span className="font-medium text-green-700">Jeddah, KSA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Encryption at Rest</span>
              <span className="font-medium text-green-700">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Encryption in Transit</span>
              <span className="font-medium text-green-700">TLS 1.3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Audit Logging</span>
              <span className="font-medium text-green-700">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Consent Tracking</span>
              <span className="font-medium text-green-700">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Audit Log (Recent 50)</h3>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading audit log...</p>
        ) : auditLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">No audit log entries yet. Entries are recorded when data is modified.</p>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Table</th>
                  <th className="table-header">Record ID</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="table-cell text-xs font-mono">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="table-cell text-xs">{log.user_id?.slice(0, 8)}...</td>
                    <td className="table-cell">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        log.action === 'INSERT' ? 'bg-green-100 text-green-700' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell text-xs font-mono">{log.table_name}</td>
                    <td className="table-cell text-xs font-mono">{log.record_id?.slice(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
