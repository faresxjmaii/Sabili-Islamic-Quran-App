import BrandLogo from '../BrandLogo';
import LanguageSelector from '../LanguageSelector';

export default function MobileTopBar({ showLanguageSelector = true }: { showLanguageSelector?: boolean }) {
  return (
    <div className="mb-5 flex items-center justify-between px-0.5 pt-3 lg:hidden">
      <BrandLogo compact />
      {showLanguageSelector ? <LanguageSelector compact /> : null}
    </div>
  );
}
