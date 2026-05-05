import { useContext } from 'react';
import { QuranAudioContext } from './QuranAudioContext';

export function useQuranAudio() {
  const context = useContext(QuranAudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within QuranAudioProvider');
  }
  return context;
}
