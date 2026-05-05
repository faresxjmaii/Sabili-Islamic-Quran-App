export type DhikrCategory = 'morning' | 'evening' | 'after-prayer';

export interface DhikrItem {
  id: string;
  category: DhikrCategory;
  arabic: string;
  translation: string;
  repeats: number;
  reference?: string;
}

export const adhkarData: DhikrItem[] = [
  {
    id: 'm1',
    category: 'morning',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...',
    translation: 'Allah - il n\'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent...',
    repeats: 1,
    reference: 'Ayat al-Kursi (Coran 2:255)'
  },
  {
    id: 'm2',
    category: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...',
    translation: 'Nous sommes au matin et la royauté appartient à Allah. Louange à Allah. Il n\'y a de divinité digne d\'adoration qu\'Allah, l\'Unique, sans associé...',
    repeats: 1,
    reference: 'Sahih Muslim'
  },
  {
    id: 'm3',
    category: 'morning',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au matin et c\'est par Toi que nous nous retrouvons au soir. C\'est par Toi que nous vivons et c\'est par Toi que nous mourons, et c\'est vers Toi que sera la résurrection.',
    repeats: 1,
    reference: 'At-Tirmidhi'
  },
  {
    id: 'm4',
    category: 'morning',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translation: 'Au nom d\'Allah, avec le nom Duquel rien ne peut nuire sur terre comme au ciel, et Il est l\'Audient, l\'Omniscient.',
    repeats: 3,
    reference: 'Abu Dawud, At-Tirmidhi'
  },
  
  {
    id: 'e1',
    category: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...',
    translation: 'Nous sommes au soir et la royauté appartient à Allah. Louange à Allah. Il n\'y a de divinité digne d\'adoration qu\'Allah, l\'Unique, sans associé...',
    repeats: 1,
    reference: 'Sahih Muslim'
  },
  {
    id: 'e2',
    category: 'evening',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au soir et c\'est par Toi que nous nous retrouvons au matin. C\'est par Toi que nous vivons et c\'est par Toi que nous mourons, et c\'est vers Toi qu\'est le retour.',
    repeats: 1,
    reference: 'At-Tirmidhi'
  },
  {
    id: 'e3',
    category: 'evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: 'Je cherche refuge auprès des paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.',
    repeats: 3,
    reference: 'Ahmad, At-Tirmidhi'
  },

  {
    id: 'p1',
    category: 'after-prayer',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    translation: 'Je demande pardon à Allah.',
    repeats: 3,
    reference: 'Sahih Muslim'
  },
  {
    id: 'p2',
    category: 'after-prayer',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    translation: 'Ô Allah, Tu es la Paix et la paix vient de Toi. Béni sois-Tu, ô Détenteur de la majesté et de la générosité.',
    repeats: 1,
    reference: 'Sahih Muslim'
  },
  {
    id: 'p3',
    category: 'after-prayer',
    arabic: 'سُبْحَانَ اللَّهِ',
    translation: 'Gloire et pureté à Allah',
    repeats: 33,
    reference: 'Sahih Muslim'
  },
  {
    id: 'p4',
    category: 'after-prayer',
    arabic: 'الْحَمْدُ لِلَّهِ',
    translation: 'La louange est à Allah',
    repeats: 33,
    reference: 'Sahih Muslim'
  },
  {
    id: 'p5',
    category: 'after-prayer',
    arabic: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah est le Plus Grand',
    repeats: 33,
    reference: 'Sahih Muslim'
  }
];

export const getAdhkarByCategory = (category: DhikrCategory) => {
  return adhkarData.filter((item) => item.category === category);
};
