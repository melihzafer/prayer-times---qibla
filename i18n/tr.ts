export const tr = {
  // General
  languageCode: 'tr',
  
  // Header
  prayerTimes: 'Namaz Vakitleri',
  noLocationSelected: 'Konum seçilmedi',
  searchPlaceholder: 'Bir şehir arayın...',
  useMyLocation: 'Konumumu kullan',
  toggleTheme: 'Temayı değiştir',
  language: 'Dil',
  login: 'Misafir Olarak Giriş Yap',
  logout: 'Çıkış Yap',
  welcomeUser: (name: string) => `Hoş geldin, ${name}! Artık namaz bildirimlerini ayarlayabilirsiniz.`,

  // Main Content
  loadingLocation: 'Konum izni isteniyor...',
  loadingPrayerTimes: 'Namaz vakitleri yükleniyor...',
  permissionError: 'Lütfen konum erişimine izin verin veya bir şehir arayın.',
  welcome: 'Hoş Geldiniz!',
  welcomeMessage: 'Namaz vakitlerini görmek için konum düğmesini kullanın veya bir şehir arayın.',
  
  // Prayer Times Display
  gregorianDate: (date: Date) => date.toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  nextPrayer: 'Sıradaki Vakit:',
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
  toggleNotification: 'Bildirimi aç/kapat',
  notificationSet: (prayer: string) => `${prayer} için bildirim ayarlandı.`,

  // Date Picker
  previousDay: 'Önceki Gün',
  nextDay: 'Sonraki Gün',
  today: 'Bugün',

  // Qibla Compass
  qiblaDirection: 'Kıble Yönü',
  activateLiveCompass: 'Canlı Pusulayı Etkinleştir',
  liveCompassActive: 'Canlı Pusula Aktif',
  compassNotSupported: 'Cihaz yönlendirme bu cihazda desteklenmiyor.',
  permissionDenied: 'Cihaz yönlendirme izni reddedildi.',
  cameraError: 'Kameraya erişilemedi. Lütfen izinleri kontrol edin.',
  cameraPermissionDenied: 'Kamera izni reddedildi. Canlı Pusulayı kullanmak için etkinleştirin.',
  calibrateCompass: 'Pusula Kalibrasyonu',
  resetCalibration: 'Kalibrasyonu Sıfırla',
  qiblaFound: 'Kıble Bulundu!',
  almostThere: 'Neredeyse Tamam...',
  keepSearching: 'Dönmeye Devam Et...',
  away: 'kaldı',
  googleQiblaFinder: 'Google Kıble Bulucu',

  // Nearby Mosques
  findNearbyMosques: 'Yakındaki Camileri Bul',
  nearbyMosques: 'Yakındaki Camiler',
  geminiInfo: 'Bilgiler Gemini tarafından sağlanmıştır',
  noApiKey: 'Bu özellik bir API anahtarı gerektirir. Devam etmek için lütfen yapılandırın.',
  noMosquesFound: 'Yakında cami bulunamadı.',
  viewOnMap: 'Haritada Gör',
  
  // Hadith of the Day
  hadithOfTheDay: 'Günün Hadisi',
  remindersFor: 'Hatırlatmalar:',
  loadingHadith: 'Hadis getiriliyor...',
  hadithError: 'Günün Hadisi getirilemedi. Lütfen daha sonra tekrar deneyin.',
  source: 'Kaynak',

  // Asma-ul-Husna (99 Names of Allah)
  asmaUlHusna: 'Esma-ül Hüsna',
  nameOfTheDay: 'Günün İsmi',
  viewAllNames: 'Tüm İsimleri Gör',
  close: 'Kapat',

  // Special Days Calendar
  islamicEventsCalendar: 'İslami Takvim',
  showCalendar: 'Takvimi Göster',
  hideCalendar: 'Takvimi Gizle',
  learnMore: 'Daha Fazla Bilgi',
  sources: 'Kaynaklar',
  nextEvent: 'Sıradaki Etkinlik',
  selectYear: 'Yıl Seçin',
  noEventsForYear: 'Seçilen Hicri yıl için etkinlik bulunamadı.',

  // Islamic Event Names
  islamicNewYear: 'Hicri Yılbaşı',
  dayOfAshura: 'Aşure Günü',
  mawlidinNabi: 'Mevlid Kandili',
  israAndMiraj: 'Miraç Kandili',
  laylatulBarat: 'Berat Kandili',
  startOfRamadan: 'Ramazan Başlangıcı',
  laylatulQadr: 'Kadir Gecesi',
  eidAlFitr: 'Ramazan Bayramı',
  dayOfArafah: 'Arefe Günü',
  eidAlAdha: 'Kurban Bayramı',

  // Footer
  footerText: 'Namaz vakitleri Aladhan API, coğrafi kodlama OpenStreetMap, bilgiler Google Gemini tarafından sağlanmaktadır.',
};