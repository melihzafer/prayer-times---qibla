import React, { useState, useMemo, useCallback } from 'react';
import { Translator, IslamicEvent } from '../types';
import { islamicEvents } from '../i18n/islamic-events';
import { getEventInformation, isGeminiAvailable } from '../services/api';
import { SparklesIcon } from './Icons';
import Loader from './Loader';

interface SpecialDaysCalendarProps {
    t: Translator;
}

const EventInfoDisplay: React.FC<{ info: any; t: Translator }> = ({ info, t }) => {
    const text = info?.information || info?.text || String(info);

    return (
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md space-y-2">
            <p className="text-sm whitespace-pre-wrap">{text}</p>
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
        return <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">{t('noApiKey')}</p>;
    }

    return (
        <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <label htmlFor="hijri-year-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('selectYear')}:</label>
                <select
                    id="hijri-year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    aria-label={t('selectYear')}
                >
                    {availableYears.map(year => <option key={year} value={year}>{year} {t('languageCode') === 'ar' ? 'هـ' : 'AH'}</option>)}
                </select>
            </div>
            {eventsForSelectedYear.length > 0 ? (
                eventsForSelectedYear.map((event, index) => {
                    const uniqueEventKey = event.nameKey + event.hijriDate;
                    return (
                    <div key={uniqueEventKey} className={`p-3 rounded-lg ${index === nextEventIndex ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">
                                    {t(event.nameKey)}
                                    {index === nextEventIndex && <span className="ml-2 rtl:mr-2 text-xs font-medium text-blue-800 bg-blue-200 dark:bg-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">{t('nextEvent')}</span>}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{event.gregorianDate} / {event.hijriDate}</p>
                            </div>
                            <button 
                                onClick={() => handleLearnMore(event)}
                                className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                                disabled={loadingEvent === uniqueEventKey}
                            >
                                <SparklesIcon className="w-4 h-4"/>
                                <span>{expandedEvent === uniqueEventKey ? t('hideCalendar') : t('learnMore')}</span>
                            </button>
                        </div>
                        {expandedEvent === uniqueEventKey && (
                            <div className="mt-2">
                                {loadingEvent === uniqueEventKey && <div className="flex justify-center p-4"><Loader /></div>}
                                {error && expandedEvent === uniqueEventKey && <p className="text-red-500 text-sm">{error}</p>}
                                {eventInfo[uniqueEventKey] && <EventInfoDisplay info={eventInfo[uniqueEventKey]} t={t} />}
                            </div>
                        )}
                    </div>
                )})
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 p-4">{t('noEventsForYear')}</p>
            )}
        </div>
    );
};

export default SpecialDaysCalendar;