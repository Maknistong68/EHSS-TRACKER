'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import DataTable, { Column } from '@/components/tables/data-table';
import TableActions from '@/components/tables/table-actions';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import { formatDate } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { X, Pencil } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

interface Incident {
  id: string;
  incident_date: string;
  severity: string;
  description: string;
  location: string;
  investigation_status: string;
  capa_status: string;
  verified: boolean;
}

const EMPTY_FORM = {
  incident_date: '', severity: 'Near-Miss', description: '', location: '', investigation_status: 'Pending', capa_status: 'Open'
};

const SEVERITIES = ['Near-Miss', 'First Aid', 'MTI', 'LTI', 'Fatality'];

export default function IncidentsPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    const { data, error } = await supabase.from('incidents').select('*').eq('project_id', currentProject.id).order('incident_date', { ascending: false });
    if (error) { toast('error', 'Failed to load incidents: ' + error.message); }
    else { setIncidents(data || []); }
    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.incident_date) errors.incident_date = 'Date is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentProject || !validate()) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from('incidents').update(form).eq('id', editingId);
      if (error) { toast('error', 'Failed to update: ' + error.message); }
      else { toast('success', 'Incident updated successfully'); }
    } else {
      const { error } = await supabase.from('incidents').insert({ project_id: currentProject.id, ...form });
      if (error) { toast('error', 'Failed to save: ' + error.message); }
      else { toast('success', 'Incident reported successfully'); }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const startEdit = (row: Incident) => {
    setForm({
      incident_date: row.incident_date,
      severity: row.severity,
      description: row.description,
      location: row.location,
      investigation_status: row.investigation_status,
      capa_status: row.capa_status,
    });
    setEditingId(row.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('incidents').delete().eq('id', deleteTarget);
    if (error) { toast('error', 'Failed to delete: ' + error.message); }
    else { toast('success', 'Incident deleted'); }
    setDeleteTarget(null);
    loadData();
  };

  const handleVerify = async (id: string, verified: boolean) => {
    const { error } = await supabase.from('incidents').update({ verified }).eq('id', id);
    if (error) { toast('error', 'Failed to update verification'); }
    else { setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, verified } : i)); }
  };

  const severityColor: Record<string, string> = {
    'Near-Miss': 'bg-blue-100 text-blue-700',
    'First Aid': 'bg-green-100 text-green-700',
    'MTI': 'bg-amber-100 text-amber-700',
    'LTI': 'bg-red-100 text-red-700',
    'Fatality': 'bg-red-600 text-white',
  };

  const columns: Column<Incident>[] = [
    { key: 'incident_date', header: 'Date', sortable: true, render: (row) => formatDate(row.incident_date) },
    {
      key: 'severity', header: 'Severity', sortable: true, render: (row) => (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', severityColor[row.severity] || '')}>{row.severity}</span>
      )
    },
    { key: 'description', header: 'Description', render: (row) => <span className="truncate max-w-[250px] block">{row.description}</span> },
    { key: 'location', header: 'Location' },
    {
      key: 'investigation_status', header: 'Investigation', render: (row) => {
        const c: Record<string, string> = { Pending: 'text-red-600', 'In Progress': 'text-amber-600', Completed: 'text-green-600' };
        return <span className={cn('text-sm font-medium', c[row.investigation_status] || '')}>{row.investigation_status}</span>;
      }
    },
    {
      key: 'capa_status', header: 'CAPA', render: (row) => {
        const c: Record<string, string> = { Open: 'text-red-600', 'In Progress': 'text-amber-600', Closed: 'text-green-600' };
        return <span className={cn('text-sm font-medium', c[row.capa_status] || '')}>{row.capa_status}</span>;
      }
    },
    {
      key: 'verified', header: 'Verified', render: (row) => (
        <input type="checkbox" checked={row.verified} onChange={(e) => handleVerify(row.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" aria-label={`Verify incident`} />
      )
    },
    {
      key: 'actions', header: '', render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => startEdit(row)} className="text-gray-400 hover:text-primary-600 p-1" aria-label="Edit incident"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteTarget(row.id)} className="text-gray-400 hover:text-red-600 p-1" aria-label="Delete incident"><X className="h-4 w-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents & Near-Miss Log</h1>
          <p className="text-sm text-gray-500">Incident tracking and CAPA management</p>
        </div>
        <TableActions onAdd={() => { setForm(EMPTY_FORM); setEditingId(null); setFormErrors({}); setShowForm(true); }} addLabel="Report Incident" />
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Incident' : 'Report New Incident'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} className={cn('input-field', formErrors.incident_date && 'border-red-400')} />
              {formErrors.incident_date && <p className="text-xs text-red-500 mt-1">{formErrors.incident_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-field">
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Status</label>
              <select value={form.investigation_status} onChange={(e) => setForm({ ...form, investigation_status: e.target.value })} className="input-field">
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CAPA Status</label>
              <select value={form.capa_status} onChange={(e) => setForm({ ...form, capa_status: e.target.value })} className="input-field">
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn('input-field h-20', formErrors.description && 'border-red-400')} placeholder="Describe the incident..." />
            {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : editingId ? 'Update Incident' : 'Save Incident'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormErrors({}); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={8} />
      ) : (
        <DataTable columns={columns} data={incidents} searchable searchKeys={['severity', 'description', 'location']} emptyMessage="No incidents recorded" exportFileName="incidents" />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Incident"
        message="Are you sure you want to delete this incident record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
