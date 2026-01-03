import React, { useState, useMemo, useCallback } from 'react';
import { Translator, IslamicEvent } from '../types';
import { islamicEvents } from '../i18n/islamic-events';
import { getEventInformation, isGeminiAvailable } from '../services/api';
import { SparklesIcon } from './Icons';
import Loader from './Loader';

interface SpecialDaysCalendarProps {
    t: Translator;
}

const EventInfoDisplay: React.FC<{ info: any; t: Translator }> = ({ info }) => {
    const text = info?.information || info?.text || String(info);

    return (
        <div className="mt-4 p-5 bg-white/30 dark:bg-brand-dark/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
            <p className="text-sm font-inter text-brand-dark dark:text-white leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
    );
};

const SpecialDaysCalendar: React.FC<SpecialDaysCalendarProps> = ({ t }) => {
    const [loadingEvent, setLoadingEvent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [eventInfo, setEventInfo] = useState<{ [key: string]: any }>({});
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    const availableYears = useMemo(() => {
        const years = new Set(islamicEvents.map(e => e.hijriDate.split(' ')[2]));
        return Array.from(years).sort((a, b) => parseInt(a) - parseInt(b));
    }, []);
    
    const getCurrentHijriYear = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sortedEvents = [...islamicEvents].sort((a, b) => new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime());

        const nextEvent = sortedEvents.find(event => new Date(event.gregorianDate) >= today);

        if (nextEvent) {
            return nextEvent.hijriDate.split(' ')[2];
        }

        return availableYears.length > 0 ? availableYears[availableYears.length - 1] : '1447';
    }, [availableYears]);

    const [selectedYear, setSelectedYear] = useState<string>(getCurrentHijriYear());

    const handleLearnMore = async (event: IslamicEvent) => {
        const eventName = t(event.nameKey);
        const uniqueEventKey = event.nameKey + event.hijriDate;
        if (expandedEvent === uniqueEventKey) {
            setExpandedEvent(null);
            return;
        }

        setExpandedEvent(uniqueEventKey);
        if (eventInfo[uniqueEventKey]) return;

        setLoadingEvent(uniqueEventKey);
        setError(null);
        try {
            const langCode = t('languageCode');
            const info = await getEventInformation(eventName, langCode);
            setEventInfo(prev => ({ ...prev, [uniqueEventKey]: info }));
        } catch (err) {
            setError('Failed to fetch event information.');
            console.error(err);
        } finally {
            setLoadingEvent(null);
        }
    };
    
    const eventsForSelectedYear = useMemo(() => {
        return islamicEvents.filter(event => event.hijriDate.endsWith(selectedYear));
    }, [selectedYear]);

    const nextEventIndex = useMemo(() => {
        if (selectedYear !== getCurrentHijriYear()) {
            return -1;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return eventsForSelectedYear.findIndex(event => new Date(event.gregorianDate) >= today);
    }, [eventsForSelectedYear, selectedYear, getCurrentHijriYear]);

    if (!isGeminiAvailable()) {
        return (
            <div className="p-8 rounded-[2rem] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-center space-y-3">
                <div className="text-3xl">🔑</div>
                <p className="text-sm font-bold font-outfit text-amber-700 dark:text-amber-400">
                    {t('noApiKey')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight">
                        Islamic Calendar
                    </h3>
                    <div className="w-8 h-1 bg-brand-primary rounded-full"></div>
                </div>
                
                <div className="flex items-center gap-3 group/select">
                    <label htmlFor="hijri-year-select" className="text-xs font-black font-outfit text-slate-400 uppercase tracking-widest">
                        {t('selectYear')}
                    </label>
                    <div className="relative">
                        <select
                            id="hijri-year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all duration-300 font-outfit font-bold text-brand-dark dark:text-white cursor-pointer group-hover/select:bg-white/80 dark:group-hover/select:bg-brand-dark/80"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year} className="bg-white dark:bg-brand-dark">
                                    {year} {t('languageCode') === 'ar' ? 'هـ' : 'AH'}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {eventsForSelectedYear.length > 0 ? (
                <div className="grid gap-4">
                    {eventsForSelectedYear.map((event, index) => {
                        const uniqueEventKey = event.nameKey + event.hijriDate;
                        const isNext = index === nextEventIndex;
                        
                        return (
                            <div 
                                key={uniqueEventKey} 
                                className={`group relative p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                                    isNext 
                                    ? 'bg-brand-primary/5 border-brand-primary/30 shadow-[0_15px_40px_rgba(37,99,235,0.08)]' 
                                    : 'bg-white/40 dark:bg-brand-dark/40 border-white/40 dark:border-white/10 hover:border-brand-primary/20 hover:bg-white/60 dark:hover:bg-brand-dark/60'
                                }`}
                            >
                                {isNext && (
                                    <div className="absolute top-0 right-0 py-3 px-6 bg-brand-primary text-white text-[10px] font-black font-outfit uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg animate-pulse">
                                        {t('nextEvent')}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <h4 className={`text-xl font-extrabold font-outfit tracking-tight leading-none ${
                                            isNext ? 'text-brand-primary' : 'text-brand-dark dark:text-white'
                                        }`}>
                                            {t(event.nameKey)}
                                        </h4>
                                        <div className="flex items-center gap-3 text-sm font-medium font-inter text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">🗓️ {event.gregorianDate}</span>
                                            <span className="opacity-30">|</span>
                                            <span className="flex items-center gap-1">🌙 {event.hijriDate}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleLearnMore(event)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold font-outfit text-sm tracking-tight transition-all duration-300 ${
                                            expandedEvent === uniqueEventKey 
                                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' 
                                            : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
                                        }`}
                                        disabled={loadingEvent === uniqueEventKey}
                                    >
                                        <SparklesIcon className={`w-4 h-4 ${loadingEvent === uniqueEventKey ? 'animate-spin' : ''}`}/>
                                        <span>{expandedEvent === uniqueEventKey ? t('hideCalendar') : t('learnMore')}</span>
                                    </button>
                                </div>

                                {expandedEvent === uniqueEventKey && (
                                    <div className="animate-fadeInScale relative z-10">
                                        {loadingEvent === uniqueEventKey && (
                                            <div className="flex justify-center py-8">
                                                <Loader />
                                            </div>
                                        )}
                                        {error && expandedEvent === uniqueEventKey && (
                                            <div className="mt-4 p-4 rounded-[1.5rem] bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-500 text-xs text-center font-bold">
                                                {error}
                                            </div>
                                        )}
                                        {eventInfo[uniqueEventKey] && <EventInfoDisplay info={eventInfo[uniqueEventKey]} t={t} />}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass bg-white/40 dark:bg-brand-dark/40 rounded-[3rem] border border-white/40 dark:border-white/10">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark/50 rounded-[2rem] flex items-center justify-center text-4xl">
                        📅
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold font-outfit text-brand-dark dark:text-white">{t('noEventsForYear')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-inter">Check back later for updates</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialDaysCalendar;