'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import DataTable, { Column } from '@/components/tables/data-table';
import TableActions from '@/components/tables/table-actions';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import { formatDate, getExpiryStatus, expiryStatusColor } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { X, Pencil } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

interface Equipment {
  id: string;
  type: string;
  equipment_id: string;
  serial_number: string;
  swl: string;
  cert_expiry: string;
  status: string;
  condition: string;
  verified: boolean;
}

const EMPTY_FORM = { type: '', equipment_id: '', serial_number: '', swl: '', cert_expiry: '', status: 'Valid', condition: 'Good' };

const EQUIPMENT_TYPES = ['Crane', 'Forklift', 'Excavator', 'Generator', 'Compressor', 'Scaffolding', 'Pump', 'Welding Machine', 'Ladder', 'Cherry Picker', 'Other'];

export default function EquipmentPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [items, setItems] = useState<Equipment[]>([]);
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
    const { data, error } = await supabase.from('equipment').select('*').eq('project_id', currentProject.id).order('type');
    if (error) { toast('error', 'Failed to load equipment: ' + error.message); }
    else { setItems(data || []); }
    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.type) errors.type = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentProject || !validate()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from('equipment').update(form).eq('id', editingId);
      if (error) { toast('error', 'Failed to update: ' + error.message); }
      else { toast('success', 'Equipment updated'); }
    } else {
      const { error } = await supabase.from('equipment').insert({ project_id: currentProject.id, ...form });
      if (error) { toast('error', 'Failed to save: ' + error.message); }
      else { toast('success', 'Equipment added'); }
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const startEdit = (r: Equipment) => {
    setForm({ type: r.type, equipment_id: r.equipment_id, serial_number: r.serial_number, swl: r.swl, cert_expiry: r.cert_expiry, status: r.status, condition: r.condition });
    setEditingId(r.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('equipment').delete().eq('id', deleteTarget);
    if (error) { toast('error', 'Failed to delete: ' + error.message); }
    else { toast('success', 'Equipment deleted'); }
    setDeleteTarget(null);
    loadData();
  };

  const statusColor: Record<string, string> = { Valid: 'bg-green-100 text-green-700', Expiring: 'bg-amber-100 text-amber-700', Expired: 'bg-red-100 text-red-700' };
  const conditionColor: Record<string, string> = { Good: 'text-green-600', Fair: 'text-amber-600', Poor: 'text-red-600', 'Out of Service': 'text-gray-500' };

  const columns: Column<Equipment>[] = [
    { key: 'type', header: 'Type', sortable: true },
    { key: 'equipment_id', header: 'Equipment ID' },
    { key: 'serial_number', header: 'Serial No.' },
    { key: 'swl', header: 'SWL' },
    {
      key: 'cert_expiry', header: 'Cert Expiry', sortable: true, render: (r) => {
        if (!r.cert_expiry) return '-';
        const expiry = getExpiryStatus(r.cert_expiry);
        return <span className={expiryStatusColor(expiry)}>{formatDate(r.cert_expiry)}</span>;
      }
    },
    { key: 'status', header: 'Status', render: (r) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColor[r.status] || '')}>{r.status}</span> },
    { key: 'condition', header: 'Condition', render: (r) => <span className={cn('text-sm font-medium', conditionColor[r.condition] || '')}>{r.condition}</span> },
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
          <h1 className="text-2xl font-bold text-gray-900">Equipment Register</h1>
          <p className="text-sm text-gray-500">Plant and equipment certification tracking</p>
        </div>
        <TableActions onAdd={() => { setForm(EMPTY_FORM); setEditingId(null); setFormErrors({}); setShowForm(true); }} addLabel="Add Equipment" />
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Equipment' : 'New Equipment'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={cn('input-field', formErrors.type && 'border-red-400')}>
                <option value="">Select type</option>
                {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment ID</label>
              <input type="text" value={form.equipment_id} onChange={(e) => setForm({ ...form, equipment_id: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input type="text" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SWL (Safe Working Load)</label>
              <input type="text" value={form.swl} onChange={(e) => setForm({ ...form, swl: e.target.value })} className="input-field" placeholder="e.g. 5 tonnes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cert Expiry</label>
              <input type="date" value={form.cert_expiry} onChange={(e) => setForm({ ...form, cert_expiry: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input-field">
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
                <option>Out of Service</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : editingId ? 'Update' : 'Save'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <TableSkeleton rows={5} cols={8} /> : (
        <DataTable columns={columns} data={items} searchable searchKeys={['type', 'equipment_id', 'serial_number']} emptyMessage="No equipment registered" exportFileName="equipment" />
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Equipment" message="Delete this equipment record?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
