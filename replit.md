# Khmer Typing Land

## Overview

Khmer Typing Land is a gamified Khmer (Cambodian) typing tutor built as a full-stack web application. It teaches users to type using the NiDA Khmer keyboard layout through a progression system of 9 worlds with 9 stages each (81 total stages). The app features multiple game modes (platform, runner, defender), cultural content (proverbs, history), badges/achievements, multiplayer racing, teacher mode for classrooms, theming, statistics tracking, and certificate generation. The project includes Google AdSense integration for monetization and a donation system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Primary Application)
- **Framework**: React 18+ with TypeScript
- **Routing**: Wouter (lightweight client-side router, not React Router)
- **State Management**: Zustand with `persist` middleware (localStorage-backed). The main store is at `client/src/lib/store.ts` and manages player profiles, progress, badges, difficulty settings, and multi-player switching.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Uses CSS custom properties for theming (light/dark mode + world-specific themes). Custom fonts: Outfit, Space Grotesk, Battambang (Khmer).
- **UI Components**: shadcn/ui component library built on Radix UI primitives, located in `client/src/components/ui/`.
- **Data Fetching**: TanStack React Query (though the app primarily runs in a "static mode" where most data is client-side).
- **Build Tool**: Vite with React plugin, configured in `vite.config.ts`. Output goes to `dist/public`.
- **Path Aliases**: `@` → `client/src`, `@shared` → `shared`, `@assets` → `attached_assets`

### Static Mode
The app has a `STATIC_MODE` flag (`client/src/lib/static-mode.ts`) set to `true`. When enabled, features requiring a server (multiplayer, teacher mode) show placeholder UI instead of connecting. This allows the app to function as a purely client-side application.

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via `tsx`
- **Entry Point**: `server/index.ts`
- **Real-time**: Socket.IO for multiplayer and teacher mode features
- **Database**: Drizzle ORM (schema in `shared/` directory). Uses PostgreSQL when available (has `@types/pg` dependency and `drizzle-kit push` script).
- **Build Process**: Custom build script at `script/build.ts` that compiles to `dist/index.cjs` for production

### Key Application Modules
- **Curriculum System** (`client/src/lib/curriculum.ts`): 9 worlds covering Khmer consonants, vowels, subscripts, combos, punctuation, digits, and advanced content. Each world has 9 stages with character pools.
- **NiDA Keyboard Map** (`client/src/lib/nida-map.ts`): Complete mapping of keyboard codes to Khmer Unicode characters for base, shift, and AltGr modifiers.
- **Finger Guide** (`client/src/lib/fingers.ts`): Maps each key code to the correct finger for typing instruction.
- **Badge System** (`client/src/lib/badges.ts`): 150+ badges unlocked by star thresholds plus performance badges (WPM, accuracy).
- **Sound System** (`client/src/lib/sounds.ts`): Web Audio API-based sound manager with multiple background music tracks.
- **Theme System** (`client/src/lib/themes.ts`): Multiple visual themes (per-world and selectable), applied via CSS custom properties.
- **Translation System** (`client/src/lib/translations.ts` + `useTranslation.ts`): English/Khmer bilingual UI with an "immersion mode" for full Khmer.
- **Cultural Content** (`client/src/lib/cultural-content.ts`): Khmer proverbs, history, daily phrases, greetings, and nature texts for typing practice.
- **Story System** (`client/src/lib/story.ts`): Narrative chapters tied to each world with intro/outro text and monster encounters.

### Game Modes
1. **Platform** - Type characters to progress through a platform level
2. **Runner** - Endless runner where typing correctly clears obstacles
3. **Defender** - Defend against enemies by typing their characters
4. **Timed Test** - Speed typing with countdown timer
5. **Accuracy Mode** - Focus on error-free typing
6. **Free Typing** - Practice with custom or preset Khmer texts
7. **Cultural Challenges** - Type Khmer proverbs and cultural texts
8. **Multiplayer** - Real-time typing races (requires server)
9. **Teacher Mode** - Classroom management with assigned texts (requires server)

### Pages and Routing
Routes are defined in `client/src/App.tsx` using Wouter's `<Switch>` and `<Route>`. Key routes:
- `/` - Landing page with player selection
- `/home` - Main hub with world selection
- `/world/:id` - Stage selection within a world
- `/play/:wid/:sid` - Gameplay for a specific stage
- `/badges`, `/library`, `/stats`, `/challenges`, `/timed`, `/accuracy`, `/free`, `/multiplayer`, `/themes`, `/cultural`, `/teacher-mode`

### Certificate System
Static HTML/CSS certificate generator at `client/public/certificates/` that accepts URL parameters (name, world, date) and can be exported as an image using html2canvas.

## External Dependencies

- **Google AdSense** (`ca-pub-2873764075574937`): Ad integration via `AdBanner` component and script tag in `index.html`
- **PostgreSQL**: Database backend via Drizzle ORM (used when not in static mode)
- **Socket.IO**: Real-time communication for multiplayer and teacher features
- **DiceBear API**: Avatar generation for certificates (`api.dicebear.com`)
- **Google Fonts**: Battambang, Outfit, Space Grotesk font families
- **html2canvas + FileSaver.js**: Client-side certificate image generation (loaded via CDN in certificate HTML)
- **Recharts**: Chart library for statistics visualization
- **Embla Carousel**: Carousel component for UI
- **react-day-picker**: Calendar component