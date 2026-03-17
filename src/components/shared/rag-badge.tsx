import { cn } from '@/lib/utils';
import { type RagStatus, ragColor, ragDot } from '@/lib/utils/rag';

interface RagBadgeProps {
  status: RagStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export default function RagBadge({ status, label, size = 'md' }: RagBadgeProps) {
  if (status === 'none') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
        N/A
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium',
        ragColor(status),
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', ragDot(status))} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
