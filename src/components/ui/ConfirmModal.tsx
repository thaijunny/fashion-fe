'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    type = 'warning',
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: AlertCircle,
            iconClass: 'bg-red-100 text-red-600',
            buttonClass: 'bg-red-600 hover:bg-red-700 shadow-red-100'
        },
        warning: {
            icon: AlertCircle,
            iconClass: 'bg-amber-100 text-amber-600',
            buttonClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
        },
        info: {
            icon: AlertCircle,
            iconClass: 'bg-blue-100 text-blue-600',
            buttonClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
        },
        success: {
            icon: AlertCircle,
            iconClass: 'bg-emerald-100 text-emerald-600',
            buttonClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
        }
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 ${config.iconClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon size={28} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm flex items-center justify-center ${config.buttonClass}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : confirmText}
                    </button>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
