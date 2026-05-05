# Al Iselm Nour

A premium Islamic web app for prayer times, Quran reading in Riwayat Qaloun, 60 Hizb browsing, Adhkar, Qibla tools, and a multilingual worship experience.

## Features

- Prayer times with location-aware calculation and manual fallback support
- Next-prayer dashboard with countdown, Hijri date, and daily prayer overview
- Quran browsing by Surah, Meccan and Medinan filters, and 60 Hizb
- Surah and Hizb readers using Riwayat Qaloun Quran data
- Daily Adhkar categories with local progress tracking
- Qibla tools with GPS, city search, and optional device compass support
- Multilingual interface with English, Arabic, and Italian options
- Responsive desktop and mobile layouts

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Framer Motion
- Lucide React

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript checks and creates a production build.
- `npm run lint` runs ESLint across the project.
- `npm run preview` serves the production build locally.

## Quran And Qaloun

The Quran reader uses Riwayat Qaloun data from a public Quran dataset and supplements chapter and Hizb metadata through public Quran API endpoints. Network availability can affect Quran and Hizb loading.

## Prayer Times

Prayer times are fetched from the public AlAdhan API. Results depend on the selected calculation method, madhab, device location accuracy, and local mosque conventions, so displayed times should be treated as guidance.

## Environment

The app currently uses public API endpoints and does not require private API keys. `.env.example` is included for future environment variables.

## Author

Fares Jmaii

GitHub: [faresxjmaii](https://github.com/faresxjmaii)
