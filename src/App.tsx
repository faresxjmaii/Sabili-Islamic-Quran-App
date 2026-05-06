import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { QuranAudioProvider } from './app/QuranAudioProvider';
import { SettingsProvider } from './app/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import PrayerNotificationScheduler from './components/PrayerNotificationScheduler';
import QuranMiniPlayer from './components/QuranMiniPlayer';
import TopNav from './components/TopNav';
import AboutPage from './pages/About';
import AdhkarPage from './pages/Adhkar';
import AdhkarDetail from './pages/AdhkarDetail';
import Home from './pages/Home';
import HizbDetail from './pages/HizbDetail';
import MorePage from './pages/More';
import PrayerTimesPage from './pages/PrayerTimes';
import QiblaPage from './pages/Qibla';
import QuranPage from './pages/Quran';
import SettingsPage from './pages/Settings';
import SurahDetail from './pages/SurahDetail';

function LocalizedAppShell() {
  return (
    <QuranAudioProvider>
      <Router>
        <div className="min-h-screen overflow-x-hidden bg-[#07111F] text-[#F8FAFC]">
          <div className="relative min-h-screen overflow-hidden bg-[#07111F]">
            <div className="app-atmosphere pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
            <TopNav />
            <main className="relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/prayer" element={<PrayerTimesPage />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/quran/hizb/:hizbNumber" element={<HizbDetail />} />
                <Route path="/quran/:surahId" element={<SurahDetail />} />
                <Route path="/adhkar" element={<AdhkarPage />} />
                <Route path="/adhkar/:category" element={<AdhkarDetail />} />
                <Route path="/qibla" element={<QiblaPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <PrayerNotificationScheduler />
            <QuranMiniPlayer />
          </div>
          <BottomNav />
        </div>
      </Router>
    </QuranAudioProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <LocalizedAppShell />
      </SettingsProvider>
    </ErrorBoundary>
  );
}
