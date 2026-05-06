import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Clock3, Home, Settings, UserRound, Wind } from 'lucide-react';
import { cn } from '../utils';
import BrandLogo from './BrandLogo';
import LanguageSelector from './LanguageSelector';
import { useSettings } from '../app/useSettings';
import { useI18n, type TranslationKey } from '../i18n';
import { validateCoordinates } from '../services/prayerService';

const navItems = [
  { to: '/', labelKey: 'navHome', icon: Home, end: true },
  { to: '/prayer', labelKey: 'navPrayer', icon: Clock3 },
  { to: '/quran', labelKey: 'navQuran', icon: BookOpen },
  { to: '/adhkar', labelKey: 'navAdhkar', icon: Wind },
  { to: '/settings', labelKey: 'navSettings', icon: Settings },
] satisfies Array<{ to: string; labelKey: TranslationKey; icon: typeof Home; end?: boolean }>;

export default function TopNav() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const locationIsConfigured = settings.location.type === 'manual'
    ? Boolean(settings.location.city) || validateCoordinates(settings.location.latitude, settings.location.longitude)
    : validateCoordinates(settings.location.latitude, settings.location.longitude);
  const hideHeaderLanguage = pathname === '/' && !locationIsConfigured;

  return (
    <header className="relative z-40 hidden border-b border-white/10 bg-[#07111F]/92 backdrop-blur-2xl lg:block">
      <div className="mx-auto flex h-[92px] max-w-[1480px] items-center gap-12 px-6 sm:px-8 xl:px-10 2xl:px-0">
        <BrandLogo />

        <nav className="flex flex-1 items-center justify-center gap-12">
          {navItems.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-2 px-1 py-3 text-[15px] font-semibold transition duration-200',
                  isActive
                    ? 'text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[#D9B45A]'
                    : 'text-[#B8C4D6] hover:text-white'
                )
              }
            >
              <Icon className="hidden size-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {hideHeaderLanguage ? null : <LanguageSelector />}
          <button
            className="grid size-12 place-items-center rounded-full border border-[#D9B45A]/45 bg-[radial-gradient(circle_at_50%_25%,#D9B45A_0%,#725F34_34%,#0A1B2E_66%)] text-white shadow-[0_10px_24px_rgba(217,180,90,0.18)] transition hover:border-[#F2C66D]"
            aria-label="Profile"
            type="button"
          >
            <UserRound className="size-4 opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
}
