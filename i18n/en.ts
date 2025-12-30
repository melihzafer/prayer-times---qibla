export const en = {
  // General
  languageCode: 'en',
  
  // Header
  prayerTimes: 'Prayer Times',
  noLocationSelected: 'No location selected',
  searchPlaceholder: 'Search for a city...',
  useMyLocation: 'Use my location',
  toggleTheme: 'Toggle theme',
  language: 'Language',
  login: 'Login as Guest',
  logout: 'Logout',
  welcomeUser: (name: string) => `Welcome, ${name}! You can now set prayer notifications.`,

  // Main Content
  loadingLocation: 'Requesting location access...',
  loadingPrayerTimes: 'Loading prayer times...',
  permissionError: 'Please grant location access or search for a city.',
  welcome: 'Welcome!',
  welcomeMessage: 'Use the location button or search for a city to get prayer times.',
  
  // Prayer Times Display
  gregorianDate: (date: Date) => date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  nextPrayer: 'Next Prayer:',
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
  toggleNotification: 'Toggle notification',
  notificationSet: (prayer: string) => `Notification set for ${prayer}.`,

  // Date Picker
  previousDay: 'Previous Day',
  nextDay: 'Next Day',
  today: 'Today',

  // Qibla Compass
  qiblaDirection: 'Qibla Direction',
  activateLiveCompass: 'Activate Live Compass',
  liveCompassActive: 'Live Compass Active',
  compassNotSupported: 'Device orientation is not supported on this device.',
  permissionDenied: 'Permission for device orientation was denied.',

  // Nearby Mosques
  findNearbyMosques: 'Find Nearby Mosques',
  nearbyMosques: 'Nearby Mosques',
  geminiInfo: 'Information provided by Gemini',
  noApiKey: 'This feature requires an API key. Please configure it to proceed.',
  noMosquesFound: 'No mosques found nearby.',
  viewOnMap: 'View on Map',

  // Hadith of the Day
  hadithOfTheDay: 'Hadith of the Day',
  remindersFor: 'Reminders for',
  loadingHadith: 'Fetching Hadith...',
  hadithError: 'Could not fetch Hadith of the Day. Please try again later.',
  source: 'Source',

  // Asma-ul-Husna (99 Names of Allah)
  asmaUlHusna: 'The 99 Names of Allah',
  nameOfTheDay: 'Name of the Day',
  viewAllNames: 'View All Names',
  close: 'Close',

  // Special Days Calendar
  islamicEventsCalendar: 'Islamic Events Calendar',
  showCalendar: 'Show Calendar',
  hideCalendar: 'Hide Calendar',
  learnMore: 'Learn More',
  sources: 'Sources',
  nextEvent: 'Next Event',
  selectYear: 'Select Year',
  noEventsForYear: 'No events found for the selected Hijri year.',
  
  // Islamic Event Names
  islamicNewYear: 'Islamic New Year',
  dayOfAshura: 'Day of Ashura',
  mawlidinNabi: 'Mawlid al-Nabi al-Sharif',
  israAndMiraj: 'Isra and Mi\'raj',
  laylatulBarat: 'Laylat al-Bara\'at',
  startOfRamadan: 'Start of Ramadan',
  laylatulQadr: 'Laylat al-Qadr',
  eidAlFitr: 'Eid al-Fitr',
  dayOfArafah: 'Day of Arafah',
  eidAlAdha: 'Eid al-Adha',

  // Footer
  footerText: 'Prayer times by Aladhan API. Geocoding by OpenStreetMap. Insights by Google Gemini.',
};