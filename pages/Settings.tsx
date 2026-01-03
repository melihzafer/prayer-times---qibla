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
        <div className="space-y-6 pb-20 animate-fadeIn">
             <div className="text-center space-y-2 mb-4 px-4">
                <h1 className="text-4xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tighter">{props.t('settings')}</h1>
                <div className="w-12 h-1 bg-brand-primary mx-auto rounded-full"></div>
             </div>
             
             <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 overflow-hidden mx-2">
                <Header {...props} />
             </div>
        </div>
    );
};

export default Settings;
