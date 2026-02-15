'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSettings } from '@/lib/api';

interface SettingsContextType {
    settings: Record<string, string>;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            const data = await fetchSettings();
            setSettings(data);
        } catch (error) {
            console.error('Lỗi tải cài đặt:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
