'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

interface ChecklistItemData {
  id: string;
  item_number: number;
  description: string;
  completed: boolean;
  notes: string | null;
  priority?: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onToggle: (id: string, completed: boolean) => void;
  onNotesChange: (id: string, notes: string) => void;
  readOnly?: boolean;
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-green-100 text-green-700',
};

export default function ChecklistItem({ item, onToggle, onNotesChange, readOnly }: ChecklistItemProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="px-4 py-2.5">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={(e) => onToggle(item.id, e.target.checked)}
          disabled={readOnly}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">#{item.item_number}</span>
            <span
              className={cn(
                'text-sm',
                item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
              )}
            >
              {item.description}
            </span>
            {item.priority && (
              <span className={cn('text-[10px] font-semibold rounded px-1.5 py-0.5', priorityColors[item.priority])}>
                {item.priority}
              </span>
            )}
          </div>

          {showNotes && (
            <textarea
              value={item.notes || ''}
              onChange={(e) => onNotesChange(item.id, e.target.value)}
              disabled={readOnly}
              placeholder="Add notes..."
              className="mt-2 input-field text-xs h-16 resize-none"
            />
          )}
        </div>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className={cn(
            'rounded p-1 hover:bg-gray-100',
            item.notes ? 'text-primary-500' : 'text-gray-300'
          )}
          title="Notes"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
