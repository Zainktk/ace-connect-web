import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface Config {
    brand_name: string;
    brand_slogan: string;
    default_location: string;
    dashboard_match_header: string;
    dashboard_find_match_title: string;
    dashboard_browse_events_title: string;
    primary_sport_icon: string;
    no_sessions_message: string;
    pro_list_title: string;
    [key: string]: string;
}

const defaultConfig: Config = {
    brand_name: 'ACE CONNECT',
    brand_slogan: 'STRIVE FOR EXCELLENCE',
    default_location: 'San Francisco, CA',
    dashboard_match_header: 'COURT COMMAND',
    dashboard_find_match_title: 'FIND MATCH',
    dashboard_browse_events_title: 'BROWSE EVENTS',
    primary_sport_icon: '🎾',
    no_sessions_message: 'No active sessions matching your form.',
    pro_list_title: 'PRO LIST'
};

interface ConfigContextType {
    config: Config;
    loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/settings/public');
                if (response.data) {
                    setConfig(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error('Failed to fetch site configuration:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
