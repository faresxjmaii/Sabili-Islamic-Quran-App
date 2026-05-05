import { type Config } from 'tailwindcss';

export default <Config>{
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#059669', // emerald
        navy: {
          DEFAULT: '#0B1B2A',
          light: '#1A365D',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#FCD34D',
        },
        offwhite: '#F8F9FA',
        paper: '#F1F5F9',
        darkbg: '#0B1121',
        darksurface: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Noto Naskh Arabic', 'serif'],
      },
    },
  },
  plugins: [],
};
