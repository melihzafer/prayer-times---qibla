import React, { useMemo } from 'react';
import { CONTEXTUAL_HADITHS, PrayerPeriod } from '../utils/contextualHadiths';
import { Translator } from '../types';

interface ContextualHadithProps {
  currentPrayerName: string;
  t: Translator;
}

const ContextualHadith: React.FC<ContextualHadithProps> = ({ currentPrayerName, t }) => {
  
  // Logic to determine which bucket to pull from
  const relevantHadith = useMemo(() => {
    // Default to 'General' if the prayer name doesn't match keys (e.g., 'Sunrise')
    let key = currentPrayerName as PrayerPeriod;
    
    // Map specific time names to our buckets
    if (currentPrayerName === 'Sunrise') key = 'Fajr'; // Sunrise is connected to Fajr warnings
    if (!CONTEXTUAL_HADITHS[key]) key = 'General';

    const collection = CONTEXTUAL_HADITHS[key];
    
    // Pick a random one from the collection to keep it fresh
    // Using the day of the year as a seed so it doesn't change on every refresh/second
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % collection.length;
    
    return collection[index];
  }, [currentPrayerName]);

  if (!relevantHadith) return null;

  return (
    <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800/50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💡</span>
        <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
          {t('remindersFor')} {currentPrayerName}
        </h3>
      </div>

      <blockquote className="italic text-gray-700 dark:text-gray-200 text-lg mb-4 font-serif">
        "{relevantHadith.hadith_english}"
      </blockquote>

      <div className="flex justify-between items-end">
         {/* Arabic Text (Smaller, for reference) */}
         <p className="text-right font-arabic text-gray-500 dark:text-gray-300 text-sm w-full opacity-80" dir="rtl">
           {relevantHadith.hadith_arabic}
         </p>
      </div>
      
      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
        <span>{relevantHadith.book}</span>
        <span className="flex items-center gap-1">
            Ref: {relevantHadith.refno}
            {relevantHadith.url && (
                 <a 
                 href={relevantHadith.url}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="ml-2 hover:underline text-blue-500"
              >
                 🔗
              </a>
            )}
        </span>
      </div>
    </div>
  );
};

export default ContextualHadith;
