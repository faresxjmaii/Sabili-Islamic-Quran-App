import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './newtab.css';

type Language = 'en' | 'ar' | 'it';
type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

type SavedLocation = {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  displayName: string;
};

type PrayerTimes = Record<PrayerName, string> & {
  Sunrise?: string;
};

type DashboardState = {
  location?: SavedLocation;
  language: Language;
};

type PrayerApiResponse = {
  data: {
    timings: Record<string, string>;
    date: {
      hijri: {
        day: string;
        year: string;
        month: { en: string; ar: string };
      };
    };
  };
};

type PlaceSearchResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
};

type ChromeStorageArea = {
  get: (keys: string[], callback: (items: Partial<DashboardState>) => void) => void;
  set: (items: Partial<DashboardState>) => void;
};

type ChromeLike = {
  storage?: {
    local?: ChromeStorageArea;
  };
};

const APP_BASE_URL = 'https://al-iselm-nour.vercel.app';
const STORAGE_KEYS = ['language', 'location'];

const chromeApi = (globalThis as typeof globalThis & { chrome?: ChromeLike }).chrome;

const strings = {
  en: {
    dashboard: 'Islamic New Tab Dashboard',
    currentTime: 'Current time',
    nextPrayer: 'Next Prayer',
    todayPrayerTimes: "Today's Prayer Times",
    dailyAyah: 'Daily Ayah',
    viewInQuran: 'View in Quran',
    openApp: 'Open Sabili App',
    quran: 'Quran',
    adhkar: 'Adhkar',
    prayerTimes: 'Prayer Times',
    settings: 'Settings',
    setupTitle: 'Set your prayer location',
    setupBody: 'Use your browser location or search your city to show accurate prayer times.',
    useLocation: 'Use browser location',
    searchPlaceholder: 'Search city or country',
    search: 'Search',
    locationUnavailable: 'Location is unavailable. Try city search or open Sabili settings.',
    loading: 'Loading prayer times...',
    noLocation: 'No prayer location selected',
    savedLocation: 'Saved location',
  },
  ar: {
    dashboard: 'لوحة تبويب إسلامية',
    currentTime: 'الوقت الحالي',
    nextPrayer: 'الصلاة القادمة',
    todayPrayerTimes: 'أوقات الصلاة اليوم',
    dailyAyah: 'آية اليوم',
    viewInQuran: 'افتح في القرآن',
    openApp: 'فتح تطبيق سبيلي',
    quran: 'القرآن',
    adhkar: 'الأذكار',
    prayerTimes: 'أوقات الصلاة',
    settings: 'الإعدادات',
    setupTitle: 'حدد موقع الصلاة',
    setupBody: 'استخدم موقع المتصفح أو ابحث عن مدينتك لعرض أوقات الصلاة بدقة.',
    useLocation: 'استخدام موقع المتصفح',
    searchPlaceholder: 'ابحث عن مدينة أو بلد',
    search: 'بحث',
    locationUnavailable: 'الموقع غير متاح. جرّب البحث عن المدينة أو افتح إعدادات سبيلي.',
    loading: 'جاري تحميل أوقات الصلاة...',
    noLocation: 'لم يتم تحديد موقع الصلاة',
    savedLocation: 'الموقع المحفوظ',
  },
  it: {
    dashboard: 'Dashboard islamica nuova scheda',
    currentTime: 'Ora attuale',
    nextPrayer: 'Prossima preghiera',
    todayPrayerTimes: 'Orari di oggi',
    dailyAyah: 'Ayah del giorno',
    viewInQuran: 'Apri nel Corano',
    openApp: 'Apri Sabili App',
    quran: 'Corano',
    adhkar: 'Adhkar',
    prayerTimes: 'Orari preghiera',
    settings: 'Impostazioni',
    setupTitle: 'Imposta la posizione di preghiera',
    setupBody: 'Usa la posizione del browser o cerca la tua città per mostrare orari accurati.',
    useLocation: 'Usa posizione browser',
    searchPlaceholder: 'Cerca città o Paese',
    search: 'Cerca',
    locationUnavailable: 'Posizione non disponibile. Cerca una città o apri le impostazioni Sabili.',
    loading: 'Caricamento orari...',
    noLocation: 'Nessuna posizione selezionata',
    savedLocation: 'Posizione salvata',
  },
};

const prayerLabels: Record<Language, Record<PrayerName, string>> = {
  en: { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
  ar: { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' },
  it: { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
};

const dailyAyahs = [
  {
    surah: 2,
    ayah: 186,
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
    meanings: {
      en: 'When My servants ask you about Me, I am near.',
      ar: 'وإذا سألك عبادي عني فإني قريب.',
      it: 'Quando i Miei servi ti chiedono di Me, Io sono vicino.',
    },
    references: { en: 'Al-Baqarah 2:186', ar: 'البقرة ٢:١٨٦', it: 'Al-Baqarah 2:186' },
  },
  {
    surah: 13,
    ayah: 28,
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    meanings: {
      en: 'Surely, in the remembrance of Allah do hearts find peace.',
      ar: 'ألا بذكر الله تطمئن القلوب.',
      it: 'Nel ricordo di Allah i cuori trovano pace.',
    },
    references: { en: 'Ar-Ra’d 13:28', ar: 'الرعد ١٣:٢٨', it: 'Ar-Ra’d 13:28' },
  },
  {
    surah: 39,
    ayah: 53,
    text: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    meanings: {
      en: 'Do not despair of the mercy of Allah.',
      ar: 'لا تقنطوا من رحمة الله.',
      it: 'Non disperate della misericordia di Allah.',
    },
    references: { en: 'Az-Zumar 39:53', ar: 'الزمر ٣٩:٥٣', it: 'Az-Zumar 39:53' },
  },
  {
    surah: 65,
    ayah: 3,
    text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    meanings: {
      en: 'Whoever relies upon Allah, He is sufficient for him.',
      ar: 'ومن يتوكل على الله فهو حسبه.',
      it: 'Chi confida in Allah, Egli gli basta.',
    },
    references: { en: 'At-Talaq 65:3', ar: 'الطلاق ٦٥:٣', it: 'At-Talaq 65:3' },
  },
];

function loadStorage(): Promise<DashboardState> {
  return new Promise((resolve) => {
    if (!chromeApi?.storage?.local) {
      resolve({ language: 'en' });
      return;
    }

    chromeApi.storage.local.get(STORAGE_KEYS, (items) => {
      resolve({
        language: items.language ?? 'en',
        location: items.location,
      });
    });
  });
}

function saveStorage(items: Partial<DashboardState>) {
  chromeApi?.storage?.local?.set(items);
}

function cleanPrayerTime(value?: string) {
  return value?.match(/\d{1,2}:\d{2}/)?.[0] ?? '--:--';
}

function getDailyAyah(date = new Date()) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours() < 12 ? 'morning' : 'evening'}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
  }

  return dailyAyahs[Math.abs(hash) % dailyAyahs.length];
}

function getNextPrayer(times?: PrayerTimes) {
  if (!times) return null;

  const now = new Date();
  const ordered: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const prayer of ordered) {
    const [hours, minutes] = cleanPrayerTime(times[prayer]).split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    if (prayerDate.getTime() > now.getTime()) {
      return { name: prayer, time: cleanPrayerTime(times[prayer]) };
    }
  }

  return { name: 'Fajr' as const, time: cleanPrayerTime(times.Fajr) };
}

async function fetchPrayerTimes(location: SavedLocation): Promise<{ timings: PrayerTimes; hijriDate: string }> {
  const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.latitude}&longitude=${location.longitude}&method=3`);
  if (!response.ok) throw new Error('Prayer times unavailable');
  const json = await response.json() as PrayerApiResponse;
  const timings = json.data.timings;

  return {
    timings: {
      Fajr: cleanPrayerTime(timings.Fajr),
      Dhuhr: cleanPrayerTime(timings.Dhuhr),
      Asr: cleanPrayerTime(timings.Asr),
      Maghrib: cleanPrayerTime(timings.Maghrib),
      Isha: cleanPrayerTime(timings.Isha),
      Sunrise: cleanPrayerTime(timings.Sunrise),
    },
    hijriDate: `${json.data.date.hijri.day} ${json.data.date.hijri.month.en} ${json.data.date.hijri.year}`,
  };
}

async function searchPlace(query: string): Promise<SavedLocation | null> {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`);
  if (!response.ok) return null;
  const [place] = await response.json() as PlaceSearchResult[];
  if (!place) return null;

  return {
    city: place.address?.city ?? place.address?.town ?? place.address?.village ?? place.display_name.split(',')[0],
    country: place.address?.country,
    displayName: place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
  };
}

function getBrowserLocation(): Promise<SavedLocation> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          city: 'GPS',
          displayName: `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      reject,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15 * 60 * 1000 }
    );
  });
}

function openApp(path = '') {
  window.open(`${APP_BASE_URL}${path}`, '_blank', 'noopener,noreferrer');
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState<SavedLocation>();
  const [time, setTime] = useState(new Date());
  const [query, setQuery] = useState('');
  const [timings, setTimings] = useState<PrayerTimes>();
  const [hijriDate, setHijriDate] = useState('');
  const [status, setStatus] = useState('');
  const t = strings[language];
  const dailyAyah = useMemo(() => getDailyAyah(), []);
  const nextPrayer = getNextPrayer(timings);

  useEffect(() => {
    loadStorage().then((stored) => {
      setLanguage(stored.language);
      setLocation(stored.location);
    });

    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    saveStorage({ language });
  }, [language]);

  useEffect(() => {
    if (!location) return;
    fetchPrayerTimes(location)
      .then((result) => {
        setTimings(result.timings);
        setHijriDate(result.hijriDate);
        setStatus('');
      })
      .catch(() => setStatus(t.locationUnavailable));
  }, [location, t.loading, t.locationUnavailable]);

  const handleLocation = async () => {
    setStatus(t.loading);
    try {
      const nextLocation = await getBrowserLocation();
      setLocation(nextLocation);
      saveStorage({ location: nextLocation });
    } catch {
      setStatus(t.locationUnavailable);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setStatus(t.loading);
    const place = await searchPlace(query.trim());
    if (!place) {
      setStatus(t.locationUnavailable);
      return;
    }
    setLocation(place);
    saveStorage({ location: place });
    setStatus('');
  };

  return (
    <main className="newtab-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => openApp()}>
          <img src="./icons/icon-128.png" alt="Sabili" />
          <span>
            <strong>Sabili</strong>
            <small>{t.dashboard}</small>
          </span>
        </button>
        <select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Language">
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="it">Italiano</option>
        </select>
      </header>

      <section className="hero-grid">
        <article className="time-card">
          <span>{t.currentTime}</span>
          <strong>{time.toLocaleTimeString(language === 'ar' ? 'ar' : language === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
          <p>{hijriDate || t.noLocation}</p>
        </article>

        <article className="next-prayer-card">
          <span>{t.nextPrayer}</span>
          <strong>{nextPrayer ? prayerLabels[language][nextPrayer.name] : '--'}</strong>
          <p>{nextPrayer?.time ?? '--:--'}</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel prayer-panel">
          <div className="panel-heading">
            <h2>{t.todayPrayerTimes}</h2>
            <small>{location ? `${t.savedLocation}: ${location.displayName}` : t.noLocation}</small>
          </div>

          {location ? (
            <div className="prayer-list">
              {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((prayer) => (
                <div key={prayer} className={nextPrayer?.name === prayer ? 'active' : ''}>
                  <span>{prayerLabels[language][prayer]}</span>
                  <strong>{timings?.[prayer] ?? '--:--'}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="setup-card">
              <h3>{t.setupTitle}</h3>
              <p>{t.setupBody}</p>
              <button type="button" onClick={handleLocation}>{t.useLocation}</button>
            </div>
          )}

          <form className="search-form" onSubmit={handleSearch}>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} />
            <button type="submit">{t.search}</button>
          </form>
          {status ? <p className="status">{status}</p> : null}
        </article>

        <article className="panel ayah-panel">
          <div className="panel-heading">
            <h2>{t.dailyAyah}</h2>
            <button type="button" onClick={() => openApp(`/quran/${dailyAyah.surah}`)}>{t.viewInQuran}</button>
          </div>
          <p className="ayah-text" dir="rtl">{dailyAyah.text}</p>
          <p className="ayah-meaning">{dailyAyah.meanings[language]}</p>
          <strong>{dailyAyah.references[language]}</strong>
        </article>
      </section>

      <nav className="quick-links" aria-label="Sabili links">
        <button type="button" onClick={() => openApp()}>{t.openApp}</button>
        <button type="button" onClick={() => openApp('/quran')}>{t.quran}</button>
        <button type="button" onClick={() => openApp('/adhkar')}>{t.adhkar}</button>
        <button type="button" onClick={() => openApp('/prayer-times')}>{t.prayerTimes}</button>
        <button type="button" onClick={() => openApp('/settings')}>{t.settings}</button>
      </nav>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
