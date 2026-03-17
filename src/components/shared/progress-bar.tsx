import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'amber' | 'red';
}

const colorMap = {
  primary: 'bg-primary-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'primary',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));

  const barColor =
    color === 'primary'
      ? percentage >= 75
        ? 'bg-green-500'
        : percentage >= 50
          ? 'bg-amber-500'
          : 'bg-red-500'
      : colorMap[color];

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-500">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-gray-200', sizeMap[size])}>
        <div
          className={cn('rounded-full transition-all duration-500', sizeMap[size], barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
