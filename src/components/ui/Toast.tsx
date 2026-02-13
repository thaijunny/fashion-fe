'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { CheckCircle2, XCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icon = {
        success: <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />,
        error: <XCircle size={18} className="text-red-500 flex-shrink-0" />,
        info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
    }[toast.type];

    const borderColor = {
        success: 'border-emerald-500/30',
        error: 'border-red-500/30',
        info: 'border-blue-500/30',
    }[toast.type];

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 bg-white border ${borderColor} rounded-xl shadow-lg shadow-black/5 min-w-[320px] max-w-[420px] transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
                }`}
            style={{ animation: isExiting ? undefined : 'slideInRight 0.3s ease-out' }}
        >
            {icon}
            <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
            <style jsx global>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
