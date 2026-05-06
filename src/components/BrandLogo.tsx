import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

type BrandLogoProps = {
  compact?: boolean;
};

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  const { t } = useI18n();

  return (
    <Link to="/" className="group flex shrink-0 items-center">
      <img
        src="/brand/sabili-logo.png"
        alt={t('appName')}
        className={compact ? 'h-auto w-[108px] object-contain' : 'h-auto w-[150px] object-contain'}
        draggable={false}
      />
    </Link>
  );
}
