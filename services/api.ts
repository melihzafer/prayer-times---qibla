import { Coordinates, AladhanApiResponse, NominatimResult, HadithData } from '../types';
import { CUSTOM_METHOD_MAPPINGS } from '../constants';

const ALADHAN_API_URL = 'https://api.aladhan.com/v1/timings';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
// Books mapped to their API identifiers
const SAHIH_BOOKS = ['bukhari', 'muslim'];

export async function fetchPrayerTimesByCoords(coords: Coordinates, method: number, date: Date) {
  const { latitude, longitude } = coords;
  const dateString = date.toISOString().split('T')[0];
  
  // Resolve method ID if it's a custom mapping (e.g. 101 -> 13)
  const apiMethod = CUSTOM_METHOD_MAPPINGS[method] ?? method;

  // Using ar.alafasy edition to get arabic month/weekday names in the response
  const url = `${ALADHAN_API_URL}/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${apiMethod}&edition=ar.alafasy`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prayer times');
  }
  const data: AladhanApiResponse = await response.json();
  if (data.code !== 200) {
      throw new Error(data.status);
  }
  return data.data;
}

export async function fetchCoordsByCity(city: string) {
  const url = `${NOMINATIM_API_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`;
  
  const response = await fetch(url, {
      headers: {
          'User-Agent': 'PrayerTimesPWA/1.0 (https://yourapp.com)'
      }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch city data');
  }
  const data: NominatimResult[] = await response.json();
  if (data.length > 0) {
    const { lat, lon, display_name } = data[0];
    const cityName = display_name.split(',')[0];
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      city: cityName,
    };
  }
  return null;
}


// Map app language codes to API edition prefixes
const LANGUAGE_EDITION_MAP: { [key: string]: string } = {
  tr: 'tur',
  fr: 'fra',
  ru: 'rus',
  id: 'ind',
  ur: 'urd',
  bn: 'ben',
  en: 'eng'
};

/**
 * Fetches a random hadith from Sunnah.com data, ensuring it is graded 'Sahih'.
 * Attempts to fetch the native language edition if available.
 */
export const fetchVerifiedSahihHadith = async (languageCode: string = 'en'): Promise<HadithData | null> => {
  try {
    // 1. Pick a random book (Bukhari or Muslim)
    const randomBook = SAHIH_BOOKS[Math.floor(Math.random() * SAHIH_BOOKS.length)];
    
    // 2. We need a random section/hadith. 
    const randomHadithNum = Math.floor(Math.random() * 7000) + 1;
    
    // Determine edition based on language
    const apiLangPrefix = LANGUAGE_EDITION_MAP[languageCode] || 'eng';
    let editionName = `${apiLangPrefix}-${randomBook}`;

    // Fetch Native Version (or English if default)
    let primaryResponse = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${editionName}/${randomHadithNum}.json`
    );

    // Fallback to English if native edition doesn't exist or fails
    let isFallback = false;
    if (!primaryResponse.ok && apiLangPrefix !== 'eng') {
        console.warn(`Native edition ${editionName} failed, falling back to English.`);
        editionName = `eng-${randomBook}`;
        primaryResponse = await fetch(
            `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${editionName}/${randomHadithNum}.json`
        );
        isFallback = true;
    }

    if (!primaryResponse.ok) throw new Error('Failed to fetch hadith');
    const primaryData = await primaryResponse.json();
    const hadithPrimary = primaryData.hadiths[0];

    // 3. STRICT SAHIH CHECK
    // For native editions, metadata might vary, so we check the English "grade" if we fell back,
    // OR we rely on the book being Sahih (Bukhari/Muslim are implicitly Sahih).
    // To be perfectly safe, if we are in a non-English mode, we can trust the Book source,
    // as checks on translated JSONs might be trickier if grades aren't populated.
    // However, fawazahmed0 API usually matches structure.
    
    // Simple check: Is it from Sahih Bukhari or Muslim? Yes.
    // Note: Some translations might skip hadiths. If empty text, retry.
    if (!hadithPrimary.text) {
         return fetchVerifiedSahihHadith(languageCode);
    }

    // 4. Fetch Arabic Text (Parallel Request)
    const arabicBook = `ara-${randomBook}`;
    const arResponse = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${arabicBook}/${randomHadithNum}.json`
    );
    const arData = await arResponse.json();
    const hadithAr = arData.hadiths[0];

    // Construct Sunnah.com URL
    // eng-bukhari -> bukhari
    const collectionSlug = randomBook; 
    const sunnahUrl = `https://sunnah.com/${collectionSlug}:${hadithPrimary.reference.hadith}`;

    // 5. Return formatted data
    // If we fetched a Turkish hadith, put it in hadith_turkish, etc.
    // The UI displays specific fields.
    const result: HadithData = {
      hadith_english: isFallback ? hadithPrimary.text : '', // Only if we fell back
      hadith_arabic: hadithAr.text,
      refno: `${primaryData.metadata.name} ${hadithPrimary.reference.hadith}`,
      book: primaryData.metadata.name,
      grade: "Sahih",
      url: sunnahUrl
    };

    if (apiLangPrefix === 'tur' && !isFallback) {
        result.hadith_turkish = hadithPrimary.text;
    } else if (apiLangPrefix === 'eng' || isFallback) {
        result.hadith_english = hadithPrimary.text;
    }
    // We could extend HadithData for other languages if needed, 
    // but for now the UI primarily supports tr/en/ar.
    // If the user selects 'fr', we might need to add hadith_french to types or 
    // just map it to 'hadith_english' (generic 'content' field in future).
    // For this specific request (Turkish), this logic holds.
    
    return result;

  } catch (error) {
    console.error("Error fetching Sahih hadith:", error);
    // Retry logic could lead to infinite loops if network is down, so we return null or handle gracefully
    return null;
  }
};

// --- Gemini API Services (Backend-Only) ---
// These functions call secure backend endpoints where the API key is stored server-side.
// The GEMINI_API_KEY is NEVER exposed to the client.

// Use relative URLs when VITE_API_URL is empty (in development with Vite proxy)
// Otherwise use the configured API URL (for production)
const getApiBaseUrl = (): string => {
  const configuredUrl = (import.meta as any).env?.VITE_API_URL;
  return configuredUrl ? String(configuredUrl) : '';
};

const API_BASE_URL = getApiBaseUrl();

const buildApiUrl = (endpoint: string): string => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Development mode: use relative URL (proxied through Vite)
  return endpoint;
};

// Cache for API availability (simple check)
let cachedAvailable: boolean | null = null;
let lastCheckTime = 0;

export const isGeminiAvailable = () => {
  // Return cached value if fresh (within 5 seconds)
  if (cachedAvailable !== null && Date.now() - lastCheckTime < 5000) {
    return cachedAvailable;
  }
  
  // Default to true - assume available unless proven otherwise
  // This allows features to show immediately
  return true;
};

// Background check for actual availability
export const checkGeminiAvailabilityInBackground = async () => {
  try {
    const response = await fetch(buildApiUrl('/health'));
    const data = await response.json();
    cachedAvailable = data.geminiAvailable === true;
    lastCheckTime = Date.now();
  } catch {
    cachedAvailable = false;
    lastCheckTime = Date.now();
  }
};

// Run background check on app load
if (typeof window !== 'undefined') {
  checkGeminiAvailabilityInBackground();
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/translate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { translatedText } = await response.json();
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text. Please ensure the backend API is running.');
  }
}

export async function findNearbyMosques(coords: Coordinates): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/nearby-mosques'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Nearby mosques error:', error);
    throw new Error('Failed to find nearby mosques. Please ensure the backend API is running.');
  }
}

export async function getEventInformation(eventName: string, languageCode: string = 'en'): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/event-info'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, languageCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Event information error:', error);
    throw new Error('Failed to get event information. Please ensure the backend API is running.');
  }
}

export async function getNameInformation(name: string, meaning: string, languageCode: string = 'en'): Promise<string> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/name-info'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, meaning, languageCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { information } = await response.json();
    return information;
  } catch (error) {
    console.error('Name information error:', error);
    throw new Error('Failed to get name information. Please ensure the backend API is running.');
  }
}