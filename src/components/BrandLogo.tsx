import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

type BrandLogoProps = {
  compact?: boolean;
};

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  const { t } = useI18n();

  return (
    <Link to="/" className="group flex shrink-0 items-center py-0.5">
      <img
        src="/brand/sabili-logo.png"
        alt={t('appName')}
        className={compact ? 'h-auto w-[84px] object-contain opacity-95 transition-opacity group-hover:opacity-100' : 'h-auto w-[112px] object-contain opacity-95 transition-opacity group-hover:opacity-100'}
        draggable={false}
      />
    </Link>
  );
}
