import React, { useEffect, useState } from 'react';
import { fetchHadithOfTheDay, translateText, isGeminiAvailable } from '../services/api';
import { HadithData, Translator } from '../types';
import Loader from './Loader';
import { BookOpenIcon } from './Icons';

interface HadithOfTheDayProps {
    t: Translator;
}

const HadithOfTheDay: React.FC<HadithOfTheDayProps> = ({ t }) => {
    const [hadith, setHadith] = useState<HadithData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getHadith = async () => {
            const today = new Date().toISOString().split('T')[0];
            const lang = t('languageCode');
            const cacheKey = `hadith-of-the-day-${today}`;
            setLoading(true);

            try {
                let hadithData: HadithData | null = null;
                const cachedHadith = localStorage.getItem(cacheKey);

                if (cachedHadith) {
                    hadithData = JSON.parse(cachedHadith);
                } else {
                    hadithData = await fetchHadithOfTheDay();
                }

                if (!hadithData) {
                    throw new Error("No hadith data found.");
                }

                // If language is Turkish and no Turkish translation exists yet, translate it
                if (lang === 'tr' && !hadithData.hadith_turkish && isGeminiAvailable()) {
                    const translatedText = await translateText(hadithData.hadith_english, 'Turkish');
                    hadithData = { ...hadithData, hadith_turkish: translatedText };
                }
                
                setHadith(hadithData);
                // Save the potentially updated hadith (with translation) back to cache
                localStorage.setItem(cacheKey, JSON.stringify(hadithData));

            } catch (err) {
                setError(t('hadithError'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getHadith();
    }, [t]);

    const getHadithTextForDisplay = () => {
        if (!hadith) return '';
        const lang = t('languageCode');
        if (lang === 'ar') {
            return hadith.hadith_arabic;
        }
        if (lang === 'tr' && hadith.hadith_turkish) {
            return hadith.hadith_turkish;
        }
        // Default to English if Turkish isn't available or for 'en' language
        return hadith.hadith_english;
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-24">
                    <Loader />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {t('loadingHadith')}
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
                </div>
            );
        }

        if (hadith) {
            return (
                <div className="space-y-4">
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4">
                        <p lang={t('languageCode')} dir={t('languageCode') === 'ar' ? 'rtl' : 'ltr'}>
                           {getHadithTextForDisplay()}
                        </p>
                    </blockquote>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right rtl:text-left">
                        <strong>{t('source')}:</strong> Sahih al-Bukhari, Hadith {hadith.refno}
                    </p>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold">{t('hadithOfTheDay')}</h2>
            </div>
            {renderContent()}
        </div>
    );
};

export default HadithOfTheDay;