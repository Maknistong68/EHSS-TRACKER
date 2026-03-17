'use client';

import { Plus, Trash2, Download } from 'lucide-react';

interface TableActionsProps {
  onAdd?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  addLabel?: string;
  showDelete?: boolean;
  showExport?: boolean;
  disabled?: boolean;
}

export default function TableActions({
  onAdd,
  onDelete,
  onExport,
  addLabel = 'Add Record',
  showDelete = false,
  showExport = false,
  disabled = false,
}: TableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onAdd && (
        <button onClick={onAdd} disabled={disabled} className="btn-primary">
          <Plus className="mr-1.5 h-4 w-4" />
          {addLabel}
        </button>
      )}
      {showDelete && onDelete && (
        <button onClick={onDelete} disabled={disabled} className="btn-danger">
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete Selected
        </button>
      )}
      {showExport && onExport && (
        <button onClick={onExport} disabled={disabled} className="btn-secondary">
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </button>
      )}
    </div>
  );
}
