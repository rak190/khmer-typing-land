# Khmer Typing Land

## Overview

Khmer Typing Land is a gamified educational web application designed to teach Khmer typing skills using the NiDA keyboard layout. The application features a story-driven progression system with 9 worlds and 81 stages, multiple game modes (platform, runner, defender), achievement badges, multiplayer racing, and detailed statistics tracking. The app supports both light and dark themes with customizable visual preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: Zustand with persist middleware for local storage persistence
- **Styling**: Tailwind CSS v4 with custom theme variables, shadcn/ui component library
- **UI Components**: Radix UI primitives wrapped with shadcn/ui styling conventions
- **Data Fetching**: TanStack React Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Real-time**: Socket.IO for multiplayer functionality
- **Build Output**: Single CommonJS bundle for production deployment

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)
- **Session Storage**: connect-pg-simple for Express sessions (if authentication added)

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`) in single repository
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules
- **Type Safety**: Drizzle-zod integration generates Zod schemas from database tables
- **Game State**: Client-side Zustand store handles all game progress, syncing to server for persistence

### Game Architecture
- **Curriculum System**: 9 worlds × 9 stages with progressive character pools
- **Mini-games**: Three game types per stage (Platform, Runner, Defender)
- **Keyboard Mapping**: NiDA Khmer layout with base, shift, and altgr modifiers
- **Badge System**: 150+ unlockable badges based on star collection and performance metrics
- **Story Integration**: Each world has narrative chapters with monster targets

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Query builder and schema management

### Real-time Communication
- **Socket.IO**: WebSocket-based multiplayer room management for typing races

### Frontend Libraries
- **Radix UI**: Accessible component primitives (dialogs, menus, tooltips, etc.)
- **Recharts**: Chart library for statistics visualization
- **date-fns**: Date formatting utilities

### Fonts
- **Google Fonts**: Battambang (Khmer), Outfit, Space Grotesk
- **Fontsource**: Kantumruy Pro, Moul (Khmer decorative font)

### Build & Development
- **Vite**: Frontend development server and bundler
- **esbuild**: Server-side production bundling
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay (development only)