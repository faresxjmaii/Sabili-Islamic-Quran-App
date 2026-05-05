import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 py-4 text-center'
    >
      <h1 className='text-2xl font-bold'>About Al Iselm Nour</h1>
      <p className='text-sm text-slate-600 dark:text-slate-300'>
        Al Iselm Nour is a premium, mobile‑first Islamic web application designed to help Muslims easily discover prayer times, read the Quran, and perform daily Adhkar. The app embraces a calm, spiritual visual language with dark navy, emerald, gold accents and smooth micro‑animations.
      </p>
      <p className='text-sm text-slate-600 dark:text-slate-300'>
        No backend is required for the initial version – all data is fetched from public APIs (AlAdhan, Quran.com) and stored locally using <code>localStorage</code> for user preferences and bookmarks.
      </p>
    </motion.div>
  );
}
