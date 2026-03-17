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

interface Document {
  id: string;
  doc_type: string;
  name: string;
  holder: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  flag: string;
}

const EMPTY_FORM = { doc_type: '', name: '', holder: '', issue_date: '', expiry_date: '', status: 'Valid', flag: 'None' };
const DOC_TYPES = ['Permit', 'Certificate', 'Insurance', 'License', 'Method Statement', 'Risk Assessment', 'Inspection Report', 'Training Certificate', 'Other'];

export default function DocumentsPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Document[]>([]);
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
    const { data, error } = await supabase.from('documents').select('*').eq('project_id', currentProject.id).order('expiry_date', { ascending: true });
    if (error) { toast('error', 'Failed to load documents: ' + error.message); }
    else { setDocs(data || []); }
    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.doc_type) errors.doc_type = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!currentProject || !validate()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from('documents').update(form).eq('id', editingId);
      if (error) { toast('error', 'Failed to update: ' + error.message); }
      else { toast('success', 'Document updated'); }
    } else {
      const { error } = await supabase.from('documents').insert({ project_id: currentProject.id, ...form });
      if (error) { toast('error', 'Failed to save: ' + error.message); }
      else { toast('success', 'Document added'); }
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const startEdit = (r: Document) => {
    setForm({ doc_type: r.doc_type, name: r.name, holder: r.holder, issue_date: r.issue_date, expiry_date: r.expiry_date, status: r.status, flag: r.flag });
    setEditingId(r.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('documents').delete().eq('id', deleteTarget);
    if (error) { toast('error', 'Failed to delete: ' + error.message); }
    else { toast('success', 'Document deleted'); }
    setDeleteTarget(null);
    loadData();
  };

  const statusColor: Record<string, string> = { Valid: 'bg-green-100 text-green-700', Expiring: 'bg-amber-100 text-amber-700', Expired: 'bg-red-100 text-red-700' };
  const flagColor: Record<string, string> = { None: '', Warning: 'text-amber-600', Critical: 'text-red-600' };

  const columns: Column<Document>[] = [
    { key: 'doc_type', header: 'Type', sortable: true },
    { key: 'name', header: 'Document Name', sortable: true },
    { key: 'holder', header: 'Holder' },
    { key: 'issue_date', header: 'Issued', render: (r) => r.issue_date ? formatDate(r.issue_date) : '-' },
    {
      key: 'expiry_date', header: 'Expires', sortable: true, render: (r) => {
        if (!r.expiry_date) return '-';
        const exp = getExpiryStatus(r.expiry_date);
        return <span className={exp.color}>{formatDate(r.expiry_date)}</span>;
      }
    },
    { key: 'status', header: 'Status', render: (r) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColor[r.status] || '')}>{r.status}</span> },
    { key: 'flag', header: 'Flag', render: (r) => r.flag !== 'None' ? <span className={cn('text-sm font-medium', flagColor[r.flag])}>{r.flag}</span> : '-' },
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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500">Permits, certificates, and document tracking</p>
        </div>
        <TableActions onAdd={() => { setForm(EMPTY_FORM); setEditingId(null); setFormErrors({}); setShowForm(true); }} addLabel="Add Document" />
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Document' : 'New Document'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })} className={cn('input-field', formErrors.doc_type && 'border-red-400')}>
                <option value="">Select type</option>
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {formErrors.doc_type && <p className="text-xs text-red-500 mt-1">{formErrors.doc_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cn('input-field', formErrors.name && 'border-red-400')} />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Holder</label>
              <input type="text" value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flag</label>
              <select value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} className="input-field">
                <option>None</option>
                <option>Warning</option>
                <option>Critical</option>
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
        <DataTable columns={columns} data={docs} searchable searchKeys={['doc_type', 'name', 'holder']} emptyMessage="No documents registered" exportFileName="documents" />
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Document" message="Delete this document?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
