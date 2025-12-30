import React from 'react';
import Header from '../components/Header';
import { Translator, UserProfile } from '../types';

interface SettingsProps {
    city: string;
    onSearch: (query: string) => void;
    onRequestLocation: () => void;
    method: number;
    setMethod: (id: number) => void;
    availableMethods: any;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: string;
    setLanguage: (lang: string) => void;
    t: Translator;
    user: UserProfile;
    login: () => void;
    logout: () => void;
}

const Settings: React.FC<SettingsProps> = (props) => {
    return (
        <div className="space-y-6">
             <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">{props.t('settings')}</h1>
             {/* reusing Header logic for now as it contains all settings */}
             <Header {...props} />
        </div>
    );
};

export default Settings;
