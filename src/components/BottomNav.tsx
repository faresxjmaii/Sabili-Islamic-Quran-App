import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Clock3, Home, MoreHorizontal, Wind } from 'lucide-react';
import { useI18n, type TranslationKey } from '../i18n';

const navItems = [
  { to: '/', labelKey: 'navHome', icon: Home },
  { to: '/prayer', labelKey: 'navSalat', icon: Clock3 },
  { to: '/quran', labelKey: 'navQuran', icon: BookOpen },
  { to: '/adhkar', labelKey: 'navAdhkar', icon: Wind },
  { to: '/more', labelKey: 'navMore', icon: MoreHorizontal },
] satisfies Array<{ to: string; labelKey: TranslationKey; icon: typeof Home }>;

export default function BottomNav() {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex h-[74px] max-w-md items-center justify-around rounded-[28px] border border-white/10 bg-[#07111F]/88 px-2 shadow-[0_-18px_60px_rgba(0,0,0,0.45),0_0_35px_rgba(16,185,129,0.08)] backdrop-blur-2xl">
        {navItems.map(({ to, labelKey, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

          return (
            <NavLink key={to} to={to} className="relative flex flex-1 flex-col items-center gap-1 py-2">
              <span
                className={[
                  'grid size-9 place-items-center rounded-2xl transition duration-200',
                  isActive ? 'bg-emerald-400/14 text-[#10B981]' : 'text-[#7D8DA3]',
                ].join(' ')}
              >
                <Icon className="size-[19px]" strokeWidth={isActive ? 2.4 : 1.8} />
              </span>
              <span className={isActive ? 'text-[10px] font-bold text-[#10B981]' : 'text-[10px] font-medium text-[#7D8DA3]'}>
                {t(labelKey)}
              </span>
              {isActive ? <span className="absolute -top-1 h-1 w-8 rounded-full bg-[#D9B45A]" /> : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
