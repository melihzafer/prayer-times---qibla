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
                <div className="space-y-6">
                    <blockquote className="relative p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 italic text-gray-700 dark:text-gray-200 group-hover:bg-brand-primary/[0.07] transition-colors duration-300">
                        <div className="absolute -top-4 -left-2 text-6xl text-brand-primary/10 font-serif opacity-30">"</div>
                        <p className="text-lg leading-relaxed font-inter font-medium" lang={t('languageCode')} dir={t('languageCode') === 'ar' ? 'rtl' : 'ltr'}>
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
        <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 border border-white/40 dark:border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-inter"></div>
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6 relative z-10 transition-transform duration-300">
                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary group-hover:scale-110">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight leading-none">{t('hadithOfTheDay')}</h2>
            </div>
            
            <div className="relative z-10 font-inter">
              {renderContent()}
            </div>
        </div>
    );
};

export default HadithOfTheDay;