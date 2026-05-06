import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

type BrandLogoProps = {
  compact?: boolean;
};

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  const { t } = useI18n();

  return (
    <Link to="/" className="group flex shrink-0 items-center py-1">
      <img
        src="/brand/sabili-logo.png"
        alt={t('appName')}
        className={compact ? 'h-[23px] w-auto object-contain opacity-85 transition-opacity group-hover:opacity-95' : 'h-[28px] w-auto object-contain opacity-85 transition-opacity group-hover:opacity-95'}
        draggable={false}
      />
    </Link>
  );
}
