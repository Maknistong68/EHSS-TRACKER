import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
    );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
    return (
        <div className="table-container">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex gap-4">
                    {Array.from({ length: cols }, (_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }, (_, r) => (
                    <div key={r} className="flex gap-4 pt-3 border-t border-gray-100">
                        {Array.from({ length: cols }, (_, c) => (
                            <Skeleton key={c} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="card space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }, (_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="card space-y-4">
                        <Skeleton className="h-5 w-1/3" />
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="space-y-1">
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <TableSkeleton rows={8} cols={7} />
                </div>
            </div>
        </div>
    );
}
