import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { quickActions } from './homeData';

export default function QuickActionsCard() {
  const { t } = useI18n();

  return (
    <section className="rounded-[24px] border border-white/10 bg-[#0F2438]/82 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:h-[300px]">
      <h3 className="mb-5 text-lg font-semibold text-white">{t('quickActions')}</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {quickActions.map(({ to, titleKey, subtitleKey, icon: Icon, accentClass, surfaceClass }) => (
          <Link
            key={to}
            to={to}
            className={`${surfaceClass} group rounded-[16px] border border-white/[0.08] p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-white/15 lg:min-h-[166px]`}
          >
            <span className={`${accentClass} mx-auto mb-3 grid size-12 place-items-center rounded-2xl border border-white/12`}>
              <Icon className="size-7" />
            </span>
            <p className="text-sm font-semibold text-white">{t(titleKey)}</p>
            <p className="mt-1 text-[11px] leading-4 text-[#DCE5EF]">{t(subtitleKey)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
