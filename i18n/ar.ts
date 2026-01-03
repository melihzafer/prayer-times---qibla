export const ar = {
  // General
  languageCode: 'ar',
  
  // Header
  prayerTimes: 'أوقات الصلاة',
  noLocationSelected: 'لم يتم تحديد موقع',
  searchPlaceholder: 'ابحث عن مدينة...',
  useMyLocation: 'استخدام موقعي',
  toggleTheme: 'تبديل السمة',
  language: 'اللغة',
  login: 'تسجيل الدخول كزائر',
  logout: 'تسجيل الخروج',
  welcomeUser: (name: string) => `أهلاً بك، ${name}! يمكنك الآن ضبط إشعارات الصلاة.`,

  // Main Content
  loadingLocation: 'جارٍ طلب الوصول إلى الموقع...',
  loadingPrayerTimes: 'جارٍ تحميل أوقات الصلاة...',
  permissionError: 'يرجى منح صلاحية الوصول إلى الموقع أو البحث عن مدينة.',
  welcome: 'أهلاً بك!',
  welcomeMessage: 'استخدم زر الموقع أو ابحث عن مدينة للحصول على أوقات الصلاة.',
  
  // Prayer Times Display
  gregorianDate: (date: Date) => date.toLocaleString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  nextPrayer: 'الصلاة التالية:',
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
  toggleNotification: 'تبديل الإشعار',
  notificationSet: (prayer: string) => `تم ضبط الإشعار لصلاة ${prayer}.`,
  
  // Date Picker
  previousDay: 'اليوم السابق',
  nextDay: 'اليوم التالي',
  today: 'اليوم',

  // Qibla Compass
  qiblaDirection: 'اتجاه القبلة',
  activateLiveCompass: 'تفعيل البوصلة الحية',
  liveCompassActive: 'البوصلة الحية نشطة',
  compassNotSupported: 'اتجاه الجهاز غير مدعوم على هذا الجهاز.',
  permissionDenied: 'تم رفض إذن الوصول إلى اتجاه الجهاز.',


  calibrateCompass: 'معايرة البوصلة',
  resetCalibration: 'إعادة ضبط المعايرة',
  qiblaFound: 'تم العثور على القبلة!',
  almostThere: 'اقتربت...',
  keepSearching: 'استمر في الدوران...',
  away: 'متبقية',
  googleQiblaFinder: 'محدد القبلة من Google',
  howToCalibrate: 'كيفية المعايرة؟',
  calibrateInstructions: 'يرجى تحريك هاتفك بحركة شكل 8 كما هو موضح لمعايرة مستشعر البوصلة.',
  imReady: 'أنا مستعد',
  calibrationGuideStep1: 'أمسك هاتفك بشكل مسطح أمامك.',
  calibrationGuideStep2: 'حركه بحركة شكل 8.',
  calibrationGuideStep3: 'كرر حتى تتحسن الدقة.',
  usingGoogleQibla: 'استخدام محدد القبلة من Google',
  googleQiblaDesc: 'للتحقق، يمكنك المقارنة مع محدد القبلة من Google. إذا كانت دقة البوصلة لدينا منخفضة، يمكن لـ Google المساعدة في إعادة معايرة مستشعرات جهازك.',
  dontShowAgain: "لا تظهر مرة أخرى",
  connectionNotSecure: "الاتصال غير آمن",
  insecureContextWarning: "المتصفح يحظر الوصول إلى البوصلة والكاميرا في هذا الاتصال. لإصلاح ذلك، يرجى استخدام 'localhost' أو اتصال HTTPS.",
  cameraError: "خطأ في الكاميرا",
  cameraPermissionDenied: "تم رفض الوصول إلى الكاميرا أو تم حظره بواسطة المتصفح.",
  browserNotice: "تعمل ميزات الواقع المعزز والبوصلة بشكل أفضل في متصفح Google Chrome.",

  // Nearby Mosques
  findNearbyMosques: 'البحث عن مساجد قريبة',
  nearbyMosques: 'مساجد قريبة',
  geminiInfo: 'المعلومات مقدمة من Gemini',
  noApiKey: 'هذه الميزة تتطلب مفتاح API. يرجى تكوينه للمتابعة.',
  noMosquesFound: 'لم يتم العثور على مساجد قريبة.',
  viewOnMap: 'عرض على الخريطة',

  // Hadith of the Day
  hadithOfTheDay: 'حديث اليوم',
  remindersFor: 'تذكير لـ',
  loadingHadith: 'جارٍ جلب الحديث...',
  hadithError: 'تعذر جلب حديث اليوم. يرجى المحاولة مرة أخرى لاحقاً.',
  source: 'المصدر',

  // Asma-ul-Husna (99 Names of Allah)
  asmaUlHusna: 'أسماء الله الحسنى',
  nameOfTheDay: 'اسم اليوم',
  viewAllNames: 'عرض كل الأسماء',
  close: 'إغلاق',

  // Special Days Calendar
  islamicEventsCalendar: 'التقويم الهجري',
  showCalendar: 'إظهار التقويم',
  hideCalendar: 'إخفاء التقويم',
  learnMore: 'اعرف المزيد',
  sources: 'المصادر',
  nextEvent: 'الحدث القادم',
  selectYear: 'اختر السنة',
  noEventsForYear: 'لم يتم العثور على أحداث للسنة الهجرية المحددة.',

  // Islamic Event Names
  islamicNewYear: 'رأس السنة الهجرية',
  regaibKandili: 'ليلة الرغائب',
  dayOfAshura: 'يوم عاشوراء',
  mawlidinNabi: 'المولد النبوي الشريف',
  israAndMiraj: 'الإسراء والمعراج',
  laylatulBarat: 'ليلة البراءة',
  startOfRamadan: 'بداية رمضان',
  laylatulQadr: 'ليلة القدر',
  eidAlFitr: 'عيد الفطر',
  dayOfArafah: 'يوم عرفة',
  eidAlAdha: 'عيد الأضحى',

  // Footer
  footerText: 'أوقات الصلاة من Aladhan API. الترميز الجغرافي من OpenStreetMap. الإحصاءات من Google Gemini.',
};