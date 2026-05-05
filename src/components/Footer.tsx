import { Link } from 'react-router-dom';
import { BookOpen, Compass, Sparkles, Wind } from 'lucide-react';

const columns = [
  { title: 'Links', items: ['Home', 'Prayer Times', 'Quran', 'Adhkar'] },
  { title: 'About', items: ['About Us', 'Features', 'Blog', 'Contact'] },
  { title: 'Support', items: ['Help Center', 'Privacy Policy', 'Terms of Service'] },
];

export default function Footer() {
  return (
    <footer className="relative hidden overflow-hidden border-t border-white/10 bg-[#06101D] lg:block">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -left-32 bottom-0 size-80 rounded-full bg-[#10B981]/10 blur-3xl" />
      <div className="absolute -right-32 top-0 size-80 rounded-full bg-[#D9B45A]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1480px] grid-cols-[1.45fr_0.9fr_0.95fr_1fr_1.2fr] gap-12 px-6 py-14 sm:px-8 xl:px-10 2xl:px-0">
        <div>
          <Link to="/" className="mb-4 flex items-center gap-3">
            <span className="relative grid size-11 place-items-center text-[#D9B45A]">
              <span className="absolute inset-1 rotate-45 rounded-[7px] border border-current" />
              <span className="absolute inset-2 rounded-[7px] border border-current" />
              <Sparkles className="size-4" />
            </span>
            <span className="text-3xl font-semibold text-white">Al Iselm Nour</span>
          </Link>
          <p className="max-w-[260px] text-sm leading-6 text-[#B8C4D6]">
            Your companion for a mindful spiritual journey.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-semibold text-white">{column.title}</h3>
            <div className="space-y-2.5">
              {column.items.map((item) => (
                <a key={item} href="#" className="block text-sm text-[#B8C4D6] transition hover:text-white">
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="border-l border-white/10 pl-10">
          <h3 className="mb-4 text-sm font-semibold text-white">Connect With Us</h3>
          <div className="mb-6 flex gap-3">
            {[BookOpen, Wind, Compass].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#B8C4D6] transition hover:border-emerald-300/30 hover:text-[#10B981]"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <p className="font-arabic text-xl text-[#F2C66D]" dir="rtl">اذكروا الله ذكرا كثيرا</p>
          <p className="mt-2 text-xs text-[#7D8DA3]">Remember Allah with much remembrance.</p>
        </div>
      </div>
    </footer>
  );
}
