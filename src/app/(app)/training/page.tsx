'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import DataTable, { Column } from '@/components/tables/data-table';
import TableActions from '@/components/tables/table-actions';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import { formatDate, getExpiryStatus } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { X, Pencil } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

interface TrainingRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  role: string;
  company: string;
  induction_date: string;
  card_expiry: string;
  training_type: string;
  status: string;
  verified: boolean;
}

const EMPTY_FORM = {
  employee_name: '', employee_id: '', role: '', company: '', induction_date: '', card_expiry: '', training_type: '', status: 'Valid'
};

const TRAINING_TYPES = ['HSSE Induction', 'First Aid', 'Fire Warden', 'Confined Space', 'Working at Height', 'Lifting Operations', 'Scaffolding', 'Electrical Safety', 'Hot Work', 'Permit to Work'];

export default function TrainingPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [records, setRecords] = useState<TrainingRecord[]>([]);
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
    const { data, error } = await supabase.from('training_records').select('*').eq('project_id', currentProject.id).order('employee_name');
    if (error) { toast('error', 'Failed to load training records: ' + error.message); }
    else { setRecords(data || []); }
    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.employee_name.trim()) errors.employee_name = 'Name is required';
    if (!form.training_type) errors.training_type = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentProject || !validate()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from('training_records').update(form).eq('id', editingId);
      if (error) { toast('error', 'Failed to update: ' + error.message); }
      else { toast('success', 'Record updated'); }
    } else {
      const { error } = await supabase.from('training_records').insert({ project_id: currentProject.id, ...form });
      if (error) { toast('error', 'Failed to save: ' + error.message); }
      else { toast('success', 'Record added'); }
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const startEdit = (r: TrainingRecord) => {
    setForm({ employee_name: r.employee_name, employee_id: r.employee_id, role: r.role, company: r.company, induction_date: r.induction_date, card_expiry: r.card_expiry, training_type: r.training_type, status: r.status });
    setEditingId(r.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('training_records').delete().eq('id', deleteTarget);
    if (error) { toast('error', 'Failed to delete: ' + error.message); }
    else { toast('success', 'Record deleted'); }
    setDeleteTarget(null);
    loadData();
  };

  const statusColor: Record<string, string> = { Valid: 'bg-green-100 text-green-700', Expiring: 'bg-amber-100 text-amber-700', Expired: 'bg-red-100 text-red-700' };

  const columns: Column<TrainingRecord>[] = [
    { key: 'employee_name', header: 'Name', sortable: true },
    { key: 'employee_id', header: 'ID' },
    { key: 'company', header: 'Company', sortable: true },
    { key: 'training_type', header: 'Training Type', sortable: true },
    { key: 'induction_date', header: 'Induction', render: (r) => r.induction_date ? formatDate(r.induction_date) : '-' },
    {
      key: 'card_expiry', header: 'Card Expiry', sortable: true, render: (r) => {
        if (!r.card_expiry) return '-';
        const expiry = getExpiryStatus(r.card_expiry);
        return <span className={expiry.color}>{formatDate(r.card_expiry)}</span>;
      }
    },
    {
      key: 'status', header: 'Status', render: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColor[r.status] || '')}>{r.status}</span>
      )
    },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => startEdit(r)} className="text-gray-400 hover:text-primary-600 p-1" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteTarget(r.id)} className="text-gray-400 hover:text-red-600 p-1" aria-label="Delete"><X className="h-4 w-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Records</h1>
          <p className="text-sm text-gray-500">Employee training, induction, and certification tracking</p>
        </div>
        <TableActions onAdd={() => { setForm(EMPTY_FORM); setEditingId(null); setFormErrors({}); setShowForm(true); }} addLabel="Add Record" />
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Record' : 'New Training Record'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} className={cn('input-field', formErrors.employee_name && 'border-red-400')} />
              {formErrors.employee_name && <p className="text-xs text-red-500 mt-1">{formErrors.employee_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input type="text" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Training Type <span className="text-red-500">*</span></label>
              <select value={form.training_type} onChange={(e) => setForm({ ...form, training_type: e.target.value })} className={cn('input-field', formErrors.training_type && 'border-red-400')}>
                <option value="">Select type</option>
                {TRAINING_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {formErrors.training_type && <p className="text-xs text-red-500 mt-1">{formErrors.training_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Induction Date</label>
              <input type="date" value={form.induction_date} onChange={(e) => setForm({ ...form, induction_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Expiry</label>
              <input type="date" value={form.card_expiry} onChange={(e) => setForm({ ...form, card_expiry: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option>Valid</option>
                <option>Expiring</option>
                <option>Expired</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <TableSkeleton rows={5} cols={8} /> : (
        <DataTable columns={columns} data={records} searchable searchKeys={['employee_name', 'company', 'training_type']} emptyMessage="No training records" exportFileName="training_records" />
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Record" message="Delete this training record? This cannot be undone." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
