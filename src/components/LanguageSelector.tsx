import { useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { languageOptions, useI18n } from '../i18n';

type LanguageSelectorProps = {
  compact?: boolean;
};

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const active = languageOptions.find((option) => option.code === language) ?? languageOptions[1];

  return (
    <div className="relative">
      <button
        className={[
          'group inline-flex items-center justify-center gap-2 border border-[#D9B45A]/25 bg-[#07111F]/88 text-[#F2C66D] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:border-[#F2C66D]/55 hover:bg-[#F2C66D]/10',
          compact ? 'h-11 rounded-2xl px-3' : 'h-12 rounded-full px-4',
        ].join(' ')}
        aria-label={t('language')}
        aria-expanded={open}
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <Languages className="size-5" />
        <span className="text-xs font-black tracking-[0.12em]">{active.short}</span>
        <ChevronDown className={open ? 'size-3.5 rotate-180 transition' : 'size-3.5 transition'} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0A1B2E]/96 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          {languageOptions.map((option) => {
            const selected = option.code === language;
            return (
              <button
                key={option.code}
                type="button"
                className={[
                  'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  selected ? 'bg-[#10B981]/14 text-[#F2C66D]' : 'text-[#DCE5EF] hover:bg-white/[0.06] hover:text-white',
                ].join(' ')}
                onClick={() => {
                  setLanguage(option.code);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {selected ? <Check className="size-4 text-[#10B981]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
