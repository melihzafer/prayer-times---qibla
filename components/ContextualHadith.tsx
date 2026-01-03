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
    <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl p-8 border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden group">
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-brand-accent/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-accent group-hover:scale-110 transition-transform duration-300">
          <span className="text-xl leading-none">💡</span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight leading-none">
            {t('remindersFor')} {currentPrayerName}
          </h3>
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em] mt-1 opacity-70">Contextual Insight</span>
        </div>
      </div>

      <blockquote className="relative p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10 italic text-gray-700 dark:text-gray-200 group-hover:bg-brand-accent/[0.07] transition-colors duration-300 font-inter mb-6">
        <div className="absolute -top-4 -left-2 text-6xl text-brand-accent/10 font-serif opacity-30">"</div>
        <p className="text-lg leading-relaxed font-medium">
          {relevantHadith.hadith_english}
        </p>
      </blockquote>

      <div className="flex justify-between items-end mb-6">
         {/* Arabic Text (Smaller, for reference) */}
         <p className="text-right font-arabic text-gray-500 dark:text-gray-300 text-sm w-full opacity-60 leading-loose italic" dir="rtl">
           {relevantHadith.hadith_arabic}
         </p>
      </div>
      
      <div className="pt-4 border-t border-brand-accent/10 flex justify-between items-center text-[11px] font-bold text-brand-accent/80 uppercase tracking-widest font-outfit">
        <span>{relevantHadith.book}</span>
        <div className="flex items-center gap-3">
            <span>Ref: {relevantHadith.refno}</span>
            {relevantHadith.url && (
                 <a 
                 href={relevantHadith.url}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="p-1.5 bg-brand-accent/10 rounded-lg hover:bg-brand-accent/20 transition-colors"
              >
                 🔗
              </a>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContextualHadith;
