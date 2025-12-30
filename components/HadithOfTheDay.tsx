import React, { useEffect, useState } from 'react';
import { fetchVerifiedSahihHadith, translateText, isGeminiAvailable } from '../services/api';
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
            // Cache by date AND language so switching languages fetches the native version
            const cacheKey = `sahih-hadith-${today}-${lang}`;
            setLoading(true);

            try {
                let hadithData: HadithData | null = null;
                const cachedHadith = localStorage.getItem(cacheKey);

                if (cachedHadith) {
                    hadithData = JSON.parse(cachedHadith);
                } else {
                    hadithData = await fetchVerifiedSahihHadith(lang);
                }

                if (!hadithData) {
                    throw new Error("No hadith data found.");
                }
                
                setHadith(hadithData);
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
                    <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-700 dark:text-gray-200 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4">
                        <p lang={t('languageCode')} dir={t('languageCode') === 'ar' ? 'rtl' : 'ltr'}>
                           {getHadithTextForDisplay()}
                        </p>
                    </blockquote>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2">
                        <span className="text-gray-500 dark:text-gray-300">
                            <strong>{t('source')}:</strong> {hadith.book}, #{hadith.refno}
                        </span>
                        
                        <div className="flex items-center gap-2">
                             <a 
                                href={hadith.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-1"
                             >
                                🔗 Verify on Sunnah.com
                             </a>
                            {/* Add Validation Badge */}
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
                                ✅ Sahih (Authentic)
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <BookOpenIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold">{t('hadithOfTheDay')}</h2>
            </div>
            {renderContent()}
        </div>
    );
};

export default HadithOfTheDay;