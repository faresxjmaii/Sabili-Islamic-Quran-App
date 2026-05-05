import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

export default function DailyAyahCard() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0F2438]/82 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:h-[300px]">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#F2C66D]">"</span>
            <h3 className="text-lg font-semibold text-white">{t('dailyAyah')}</h3>
          </div>
          <Link to="/quran" className="text-xs font-semibold text-[#F2C66D]">{t('viewInQuran')}</Link>
        </div>
        <p className="font-arabic text-right text-xl leading-[1.9] text-white drop-shadow-[0_0_22px_rgba(242,198,109,0.18)]" dir="rtl">
          {t('dailyAyahText')}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#DCE5EF]">
          {t('dailyAyahMeaning')}
        </p>
        <p className="mt-3 text-sm font-medium text-[#D9B45A]">{t('dailyAyahReference')}</p>
      </div>
    </section>
  );
}
