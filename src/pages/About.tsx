import { motion } from 'framer-motion';
import { useI18n } from '../i18n';

export default function About() {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-5 px-4 py-6 text-center"
    >
      <h1 className="text-2xl font-bold text-white">{t('aboutTitle')}</h1>
      <p className="text-sm leading-7 text-[#B8C4D6]">{t('aboutP1')}</p>
      <p className="text-sm leading-7 text-[#B8C4D6]">{t('aboutP2')}</p>
    </motion.div>
  );
}
