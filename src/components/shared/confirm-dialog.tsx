'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative z-[61] w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl mx-4">
                <div className="flex items-start gap-4">
                    <div className={`rounded-full p-2 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
                        <AlertTriangle className={`h-5 w-5 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onCancel} className="btn-secondary">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} className="btn-danger">
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
