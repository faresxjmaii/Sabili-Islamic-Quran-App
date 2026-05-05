import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../utils';
import { Compass, Settings, Info } from 'lucide-react';
import { useI18n } from '../i18n';

export default function MorePage(){
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4"
    >
      <h1 className="text-2xl font-bold text-center">{t('navMore')}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/qibla"
          className={cn('p-4 glass rounded-xl hover:scale-[1.02] transition flex items-center gap-2')}
        >
          <Compass size={20} />
          <span>{t('qibla')}</span>
        </Link>
        <Link
          to="/settings"
          className={cn('p-4 glass rounded-xl hover:scale-[1.02] transition flex items-center gap-2')}
        >
          <Settings size={20} />
          <span>{t('navSettings')}</span>
        </Link>
        <Link
          to="/about"
          className={cn('p-4 glass rounded-xl hover:scale-[1.02] transition flex items-center gap-2')}
        >
          <Info size={20} />
          <span>{t('about')}</span>
        </Link>
      </div>
    </motion.div>
  );
}
