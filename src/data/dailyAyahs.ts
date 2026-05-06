import type { Language } from '../types';

export type DailyAyah = {
  surah: number;
  ayah: number;
  text: string;
  meanings: Record<Language, string>;
  references: Record<Language, string>;
};

export const dailyAyahs: DailyAyah[] = [
  {
    surah: 2,
    ayah: 186,
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    meanings: {
      en: 'When My servants ask you about Me, I am near. I answer the call of the caller when he calls upon Me.',
      ar: 'وإذا سألك عبادي عني فإني قريب أجيب دعوة الداعي إذا دعاني.',
      it: 'Quando i Miei servi ti chiedono di Me, Io sono vicino e rispondo alla preghiera di chi Mi invoca.',
    },
    references: { en: 'Al-Baqarah 2:186', ar: 'البقرة ٢:١٨٦', it: 'Al-Baqarah 2:186' },
  },
  {
    surah: 2,
    ayah: 286,
    text: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    meanings: {
      en: 'Allah does not burden a soul beyond what it can bear.',
      ar: 'لا يكلّف الله نفسًا إلا وسعها.',
      it: 'Allah non impone a nessuna anima oltre la sua capacità.',
    },
    references: { en: 'Al-Baqarah 2:286', ar: 'البقرة ٢:٢٨٦', it: 'Al-Baqarah 2:286' },
  },
  {
    surah: 3,
    ayah: 139,
    text: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    meanings: {
      en: 'Do not lose hope, nor be sad. You will be superior if you are true believers.',
      ar: 'ولا تضعفوا ولا تحزنوا وأنتم الأعلون إن كنتم مؤمنين.',
      it: 'Non perdetevi d’animo e non siate tristi: sarete superiori se siete credenti.',
    },
    references: { en: 'Aal-Imran 3:139', ar: 'آل عمران ٣:١٣٩', it: 'Aal-Imran 3:139' },
  },
  {
    surah: 13,
    ayah: 28,
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    meanings: {
      en: 'Surely, in the remembrance of Allah do hearts find peace.',
      ar: 'ألا بذكر الله تطمئن القلوب.',
      it: 'In verità, nel ricordo di Allah i cuori trovano pace.',
    },
    references: { en: 'Ar-Ra’d 13:28', ar: 'الرعد ١٣:٢٨', it: 'Ar-Ra’d 13:28' },
  },
  {
    surah: 14,
    ayah: 7,
    text: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    meanings: {
      en: 'If you are grateful, I will surely increase you.',
      ar: 'لئن شكرتم لأزيدنكم.',
      it: 'Se siete riconoscenti, certamente vi aumenterò.',
    },
    references: { en: 'Ibrahim 14:7', ar: 'إبراهيم ١٤:٧', it: 'Ibrahim 14:7' },
  },
  {
    surah: 20,
    ayah: 46,
    text: 'لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ',
    meanings: {
      en: 'Do not fear. I am with you both; I hear and I see.',
      ar: 'لا تخافا إنني معكما أسمع وأرى.',
      it: 'Non temete: Io sono con voi, ascolto e vedo.',
    },
    references: { en: 'Ta-Ha 20:46', ar: 'طه ٢٠:٤٦', it: 'Ta-Ha 20:46' },
  },
  {
    surah: 29,
    ayah: 69,
    text: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
    meanings: {
      en: 'Those who strive for Our sake, We will surely guide them to Our ways.',
      ar: 'والذين جاهدوا فينا لنهدينهم سبلنا.',
      it: 'Coloro che si impegnano per Noi, li guideremo certamente sulle Nostre vie.',
    },
    references: { en: 'Al-Ankabut 29:69', ar: 'العنكبوت ٢٩:٦٩', it: 'Al-Ankabut 29:69' },
  },
  {
    surah: 33,
    ayah: 41,
    text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا',
    meanings: {
      en: 'O believers, remember Allah with frequent remembrance.',
      ar: 'يا أيها الذين آمنوا اذكروا الله ذكرًا كثيرًا.',
      it: 'O credenti, ricordate Allah con abbondante ricordo.',
    },
    references: { en: 'Al-Ahzab 33:41', ar: 'الأحزاب ٣٣:٤١', it: 'Al-Ahzab 33:41' },
  },
  {
    surah: 39,
    ayah: 53,
    text: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    meanings: {
      en: 'Do not despair of the mercy of Allah.',
      ar: 'لا تقنطوا من رحمة الله.',
      it: 'Non disperate della misericordia di Allah.',
    },
    references: { en: 'Az-Zumar 39:53', ar: 'الزمر ٣٩:٥٣', it: 'Az-Zumar 39:53' },
  },
  {
    surah: 65,
    ayah: 3,
    text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    meanings: {
      en: 'Whoever relies upon Allah, He is sufficient for him.',
      ar: 'ومن يتوكل على الله فهو حسبه.',
      it: 'Chi confida in Allah, Egli gli basta.',
    },
    references: { en: 'At-Talaq 65:3', ar: 'الطلاق ٦٥:٣', it: 'At-Talaq 65:3' },
  },
];

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const halfDay = date.getHours() < 12 ? 'morning' : 'evening';

  return `${year}-${month}-${day}-${halfDay}`;
}

function hashKey(key: string) {
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

export function getDailyAyah(date = new Date()) {
  const rotationKey = getLocalDateKey(date);
  const index = hashKey(rotationKey) % dailyAyahs.length;

  return {
    ayah: dailyAyahs[index],
    rotationKey,
  };
}

export function getNextDailyAyahRotationDelay(date = new Date()) {
  const nextRotation = new Date(date);

  if (date.getHours() < 12) {
    nextRotation.setHours(12, 0, 0, 0);
  } else {
    nextRotation.setDate(nextRotation.getDate() + 1);
    nextRotation.setHours(0, 0, 0, 0);
  }

  return Math.max(1000, nextRotation.getTime() - date.getTime());
}
