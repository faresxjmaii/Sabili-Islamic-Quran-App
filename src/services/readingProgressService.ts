export type ReaderType = 'surah' | 'hizb';

export interface ReadingProgress {
  readerType: ReaderType;
  surahNumber?: number;
  hizbNumber?: number;
  surahName?: string;
  verseKey: string;
  ayahNumber: number;
  route: string;
  scrollY?: number;
  updatedAt: string;
}

const PROGRESS_KEY = 'sakina_reading_progress';

export const readingProgressService = {
  save(progress: Omit<ReadingProgress, 'updatedAt'>): void {
    const full: ReadingProgress = {
      ...progress,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(full));
  },

  get(): ReadingProgress | null {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(PROGRESS_KEY);
  },
};
