'use client';

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

const icons: Record<ToastType, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors: Record<ToastType, string> = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const Icon = icons[t.type];

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(t.id), 5000);
        return () => clearTimeout(timer);
    }, [t.id, onDismiss]);

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-lg border p-3 shadow-lg animate-in slide-in-from-right',
                colors[t.type]
            )}
            role="alert"
        >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[t.type])} />
            <p className="text-sm flex-1">{t.message}</p>
            <button
                onClick={() => onDismiss(t.id)}
                className="flex-shrink-0 rounded p-0.5 hover:bg-black/5"
                aria-label="Dismiss notification"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
