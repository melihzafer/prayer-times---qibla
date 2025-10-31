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

const InfoDisplay: React.FC<{ info: GenerateContentResponse; t: Translator }> = ({ info, t }) => {
    const text = info.text;
    return (
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{text}</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <StarIcon className="h-6 w-6 text-yellow-500" />
                        <h2 className="text-xl font-bold">{t('asmaUlHusna')}</h2>
                    </div>
                     <button
                        onClick={() => setShowAll(true)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t('viewAllNames')}
                    </button>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('nameOfTheDay')}</p>
                    <p className="text-4xl font-bold font-serif my-2" lang="ar">{nameOfTheDay.arabic}</p>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{nameOfTheDay.transliteration}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{nameOfTheDay[lang]}</p>
                </div>
            </div>

            {showAll && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
                    onClick={() => setShowAll(false)}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-11/12 max-w-4xl h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{t('asmaUlHusna')}</h3>
                             <button onClick={() => setShowAll(false)} className="px-3 py-1 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">&times; {t('close')}</button>
                        </div>
                        <div className="overflow-y-auto p-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {asmaUlHusna.map(name => (
                                    <div key={name.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700 flex flex-col justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 text-right">{name.id}</p>
                                            <div className="text-center">
                                                <p className="text-3xl font-serif" lang="ar">{name.arabic}</p>
                                                <p className="font-semibold text-blue-600 dark:text-blue-400">{name.transliteration}</p>
                                                <p className="text-sm mt-1">{name[lang]}</p>
                                            </div>
                                        </div>
                                         {isGeminiAvailable() && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleLearnMore(name.id)}
                                                    className="flex w-full justify-center items-center space-x-1 rtl:space-x-reverse text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                                                    disabled={loadingInfo === name.id}
                                                >
                                                    <SparklesIcon className="w-4 h-4" />
                                                    <span>{expandedName === name.id ? t('hideCalendar') : t('learnMore')}</span>
                                                </button>
                                                {expandedName === name.id && (
                                                    <div className="mt-2">
                                                        {loadingInfo === name.id && <div className="flex justify-center p-2"><Loader /></div>}
                                                        {error && expandedName === name.id && <p className="text-red-500 text-xs text-center">{error}</p>}
                                                        {nameInfo[name.id] && <InfoDisplay info={nameInfo[name.id]} t={t} />}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AsmaUlHusna;
