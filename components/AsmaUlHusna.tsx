import React, { useState, useMemo } from 'react';
import { Translator } from '../types';
import { asmaUlHusna } from '../i18n/asma-ul-husna';
import { StarIcon, SparklesIcon } from './Icons';
import Loader from './Loader';
import { getNameInformation, isGeminiAvailable } from '../services/api';
import { GenerateContentResponse } from '@google/genai';

interface AsmaUlHusnaProps {
    t: Translator;
}

const InfoDisplay: React.FC<{ info: GenerateContentResponse; t: Translator }> = ({ info }) => {
    const text = info.text;
    return (
        <div className="mt-4 p-5 bg-white/30 dark:bg-brand-dark/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
            <p className="text-sm font-inter text-brand-dark dark:text-white leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
    );
};

const AsmaUlHusna: React.FC<AsmaUlHusnaProps> = ({ t }) => {
    const [showAll, setShowAll] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nameInfo, setNameInfo] = useState<{ [key: number]: GenerateContentResponse }>({});
    const [expandedName, setExpandedName] = useState<number | null>(null);

    const nameOfTheDay = useMemo(() => {
        const start = new Date(new Date().getFullYear(), 0, 0);
        const diff = (new Date() as any) - (start as any);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return asmaUlHusna[dayOfYear % 99];
    }, []);

    const handleLearnMore = async (nameId: number) => {
        if (expandedName === nameId) {
            setExpandedName(null);
            return;
        }

        setExpandedName(nameId);
        if (nameInfo[nameId]) return;

        setLoadingInfo(nameId);
        setError(null);
        try {
            const langCode = t('languageCode');
            const nameData = asmaUlHusna.find(n => n.id === nameId);
            if(nameData){
                const info = await getNameInformation(nameData.transliteration, nameData[langCode as 'en' | 'tr' | 'ar'], langCode);
                setNameInfo(prev => ({ ...prev, [nameId]: info }));
            }
        } catch (err) {
            setError('Failed to fetch information.');
            console.error(err);
        } finally {
            setLoadingInfo(null);
        }
    };

    const lang = t('languageCode') as 'en' | 'tr' | 'ar';

    return (
        <>
            <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 border border-white/40 dark:border-white/10 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all duration-500"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-brand-primary/10 text-brand-primary shadow-inner">
                                <StarIcon className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight leading-none">
                                {t('asmaUlHusna')}
                            </h2>
                        </div>
                        <div className="w-12 h-1 bg-brand-primary rounded-full ml-11"></div>
                    </div>
                    
                    <button
                        onClick={() => setShowAll(true)}
                        className="px-6 py-3 text-sm font-bold font-outfit text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white rounded-2xl transition-all duration-300 active:scale-95 shadow-sm"
                    >
                        {t('viewAllNames')}
                    </button>
                </div>

                <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-white/60 to-white/40 dark:from-brand-dark/60 dark:to-brand-dark/40 border border-white/40 dark:border-white/10 shadow-[inner_0_2px_10px_rgba(0,0,0,0.03)] text-center space-y-4">
                    <p className="text-xs font-black font-outfit text-brand-accent tracking-widest uppercase opacity-80">
                        ✨ {t('nameOfTheDay')}
                    </p>
                    <div className="space-y-1">
                        <p className="text-6xl font-black font-serif text-brand-dark dark:text-white drop-shadow-sm" lang="ar">
                            {nameOfTheDay.arabic}
                        </p>
                        <p className="text-2xl font-extrabold font-outfit text-brand-primary tracking-tighter">
                            {nameOfTheDay.transliteration}
                        </p>
                    </div>
                    <p className="text-lg font-medium font-inter text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                        {nameOfTheDay[lang]}
                    </p>
                </div>
            </div>

            {showAll && (
                <div 
                    className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6"
                >
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md animate-fadeIn"
                        onClick={() => setShowAll(false)}
                    ></div>

                    {/* Modal */}
                    <div 
                        className="glass bg-white/95 dark:bg-brand-dark/95 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] w-full max-w-6xl h-[90vh] flex flex-col border border-white/40 dark:border-white/10 relative z-10 overflow-hidden animate-scaleInTransform"
                    >
                        {/* Header */}
                        <div className="p-8 sm:px-12 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-white/30 dark:bg-brand-dark/30 backdrop-blur-xl">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tighter flex items-center gap-3">
                                    <span className="text-brand-primary">✨</span>
                                    {t('asmaUlHusna')}
                                </h3>
                                <div className="w-12 h-1 bg-brand-primary rounded-full"></div>
                            </div>
                            <button 
                                onClick={() => setShowAll(false)} 
                                className="p-4 rounded-[1.5rem] bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 text-slate-400 hover:text-brand-dark dark:hover:text-white hover:border-brand-primary/30 transition-all duration-300 group"
                            >
                                <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search and Grid Container */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {asmaUlHusna.map(name => (
                                    <div 
                                        key={name.id} 
                                        className="group relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-brand-dark/40 border border-white/40 dark:border-white/10 hover:border-brand-primary/30 hover:bg-white/60 dark:hover:bg-brand-dark/60 transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                            <span className="text-4xl font-black font-outfit text-brand-dark dark:text-white">{name.id}</span>
                                        </div>

                                        <div className="relative">
                                            <div className="text-center space-y-4">
                                                <p className="text-5xl font-black font-serif text-brand-dark dark:text-white group-hover:scale-110 transition-transform duration-500" lang="ar">
                                                    {name.arabic}
                                                </p>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-extrabold font-outfit text-brand-primary tracking-tighter">
                                                        {name.transliteration}
                                                    </p>
                                                     <p className="text-sm font-medium font-inter text-slate-600 dark:text-slate-300 leading-relaxed px-4">
                                                        {name[lang]}
                                                     </p>
                                                </div>
                                            </div>
                                        </div>

                                        {isGeminiAvailable() && (
                                            <div className="mt-8 relative z-10">
                                                <button
                                                    onClick={() => handleLearnMore(name.id)}
                                                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold font-outfit text-sm tracking-tight transition-all duration-300 ${
                                                        expandedName === name.id 
                                                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' 
                                                        : 'bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10'
                                                    }`}
                                                    disabled={loadingInfo === name.id}
                                                >
                                                    <SparklesIcon className={`w-4 h-4 ${loadingInfo === name.id ? 'animate-spin' : ''}`} />
                                                    <span>{expandedName === name.id ? t('hideCalendar') : t('learnMore')}</span>
                                                </button>
                                                
                                                {expandedName === name.id && (
                                                    <div className="animate-fadeInScale">
                                                        {loadingInfo === name.id && (
                                                            <div className="flex justify-center py-6">
                                                                <Loader />
                                                            </div>
                                                        )}
                                                        {error && expandedName === name.id && (
                                                            <div className="mt-4 p-4 rounded-[1.5rem] bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-500 text-xs text-center font-bold">
                                                                {error}
                                                            </div>
                                                        )}
                                                        {nameInfo[name.id] && <InfoDisplay info={nameInfo[name.id]} t={t} />}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 sm:px-12 bg-white/30 dark:bg-brand-dark/30 backdrop-blur-xl border-t border-white/40 dark:border-white/10 flex justify-center sm:justify-end">
                            <button 
                                onClick={() => setShowAll(false)} 
                                className="px-12 py-4 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-[1.25rem] font-extrabold font-outfit text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
                            >
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AsmaUlHusna;
