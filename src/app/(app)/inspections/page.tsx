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

interface Inspection {
  id: string;
  inspection_date: string;
  type: string;
  location: string;
  inspector: string;
  findings: string;
  ncr_count: number;
  status: string;
  verified: boolean;
}

const EMPTY_FORM = {
  inspection_date: '', type: '', location: '', inspector: '', findings: '', ncr_count: 0, status: 'Open'
};

const TYPES = ['Routine HSE', 'Management Walkthrough', 'Environmental', 'Fire Safety', 'Electrical Safety', 'Scaffolding', 'Housekeeping', 'PPE Compliance'];

export default function InspectionsPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
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
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('project_id', currentProject.id)
      .order('inspection_date', { ascending: false });
    if (error) {
      toast('error', 'Failed to load inspections: ' + error.message);
    } else {
      setInspections(data || []);
    }
    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.inspection_date) errors.inspection_date = 'Date is required';
    if (!form.type) errors.type = 'Type is required';
    if (!form.inspector) errors.inspector = 'Inspector is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentProject || !validate()) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from('inspections').update(form).eq('id', editingId);
      if (error) { toast('error', 'Failed to update: ' + error.message); }
      else { toast('success', 'Inspection updated successfully'); }
    } else {
      const { error } = await supabase.from('inspections').insert({ project_id: currentProject.id, ...form });
      if (error) { toast('error', 'Failed to save: ' + error.message); }
      else { toast('success', 'Inspection added successfully'); }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const startEdit = (row: Inspection) => {
    setForm({
      inspection_date: row.inspection_date,
      type: row.type,
      location: row.location,
      inspector: row.inspector,
      findings: row.findings,
      ncr_count: row.ncr_count,
      status: row.status,
    });
    setEditingId(row.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('inspections').delete().eq('id', deleteTarget);
    if (error) { toast('error', 'Failed to delete: ' + error.message); }
    else { toast('success', 'Inspection deleted'); }
    setDeleteTarget(null);
    loadData();
  };

  const handleVerify = async (id: string, verified: boolean) => {
    const { error } = await supabase.from('inspections').update({ verified }).eq('id', id);
    if (error) { toast('error', 'Failed to update verification'); }
    else { setInspections((prev) => prev.map((i) => i.id === id ? { ...i, verified } : i)); }
  };

  const statusColor: Record<string, string> = {
    Open: 'bg-red-100 text-red-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Closed: 'bg-green-100 text-green-700',
  };

  const columns: Column<Inspection>[] = [
    { key: 'inspection_date', header: 'Date', sortable: true, render: (row) => formatDate(row.inspection_date) },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'location', header: 'Location' },
    { key: 'inspector', header: 'Inspector', sortable: true },
    { key: 'findings', header: 'Findings', render: (row) => <span className="truncate max-w-[200px] block">{row.findings || '-'}</span> },
    { key: 'ncr_count', header: 'NCRs', sortable: true, className: 'text-center' },
    {
      key: 'status', header: 'Status', render: (row) => (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColor[row.status] || '')}>{row.status}</span>
      )
    },
    {
      key: 'verified', header: 'Verified', render: (row) => (
        <input type="checkbox" checked={row.verified} onChange={(e) => handleVerify(row.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600" aria-label={`Mark ${row.type} as verified`} />
      )
    },
    {
      key: 'actions', header: '', render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => startEdit(row)} className="text-gray-400 hover:text-primary-600 p-1" aria-label="Edit inspection"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteTarget(row.id)} className="text-gray-400 hover:text-red-600 p-1" aria-label="Delete inspection"><X className="h-4 w-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-sm text-gray-500">HSE inspection log and tracking</p>
        </div>
        <TableActions onAdd={() => { setForm(EMPTY_FORM); setEditingId(null); setFormErrors({}); setShowForm(true); }} addLabel="Add Inspection" />
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Inspection' : 'New Inspection'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.inspection_date} onChange={(e) => setForm({ ...form, inspection_date: e.target.value })} className={cn('input-field', formErrors.inspection_date && 'border-red-400 focus:border-red-500 focus:ring-red-500')} />
              {formErrors.inspection_date && <p className="text-xs text-red-500 mt-1">{formErrors.inspection_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={cn('input-field', formErrors.type && 'border-red-400')}>
                <option value="">Select type</option>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g. Zone A, Building 3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector <span className="text-red-500">*</span></label>
              <input type="text" value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} className={cn('input-field', formErrors.inspector && 'border-red-400')} placeholder="Inspector name" />
              {formErrors.inspector && <p className="text-xs text-red-500 mt-1">{formErrors.inspector}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NCR Count</label>
              <input type="number" value={form.ncr_count} onChange={(e) => setForm({ ...form, ncr_count: Number(e.target.value) })} className="input-field" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
            <textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} className="input-field h-20" placeholder="Describe inspection findings..." />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : editingId ? 'Update Inspection' : 'Save Inspection'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormErrors({}); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={8} />
      ) : (
        <DataTable columns={columns} data={inspections} searchable searchKeys={['type', 'location', 'inspector', 'findings']} emptyMessage="No inspections recorded yet" exportFileName="inspections" />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Inspection"
        message="Are you sure you want to delete this inspection? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
