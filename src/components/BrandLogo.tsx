import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

type BrandLogoProps = {
  compact?: boolean;
};

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  const { t } = useI18n();

  return (
    <Link to="/" className="group flex shrink-0 items-center gap-3">
      <div className={compact ? 'relative grid size-11 place-items-center text-[#D9B45A]' : 'relative grid size-12 place-items-center text-[#D9B45A]'}>
        <svg className={compact ? 'size-6' : 'size-7'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
        <span className="absolute size-1.5 rounded-full bg-[#D9B45A] shadow-[0_0_24px_6px_rgba(217,180,90,0.9)]" />
      </div>
      <div>
        <span className={compact ? 'block text-xl font-semibold tracking-[-0.02em] text-white' : 'block text-2xl font-semibold tracking-[-0.02em] text-white'}>
          Al Iselm Nour
        </span>
        {compact ? <span className="block text-xs font-semibold text-[#D9B45A]">{t('peacefulWorship')}</span> : null}
      </div>
    </Link>
  );
}
