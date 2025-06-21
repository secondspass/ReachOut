# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:** `expo start`
**Run on Android:** `expo run:android` (requires USB debugging and device connected)
**Run Android release build:** `expo run:android --variant release`
**Run on web:** `expo start --web`
**Lint code:** `expo lint`
**Clean build:** `npx expo prebuild --clean` (use if hot reloading isn't working)

## Architecture Overview

ReachOut is a React Native friend reminder app built with Expo Router and TypeScript. The app helps users track when to contact friends based on custom time intervals.

### Key Architecture Patterns:

**Navigation:** Uses Expo Router with file-based routing. Main screens are `index.tsx` (friend list) and `settings.tsx` (backup/restore).

**State Management:** Uses React hooks (useState, useEffect) with AsyncStorage for persistence via custom data operations in `src/utils/dataoperations.ts`.

**Data Flow:** Friend data is loaded/saved automatically using `useFocusEffect` hooks. The main app re-renders when returning from other screens to refresh contact countdowns.

**Core Logic:** Contact reminder calculations are based on comparing current date with `firstContactDate` and `lastContactDate` plus `frequencyDays`. The app shows days remaining until next contact, with color coding for urgency.

### File Structure:
- `src/app/` - Main screens using Expo Router
- `src/components/` - Reusable components (BackupModal)
- `src/services/` - Business logic (backupService.ts)
- `src/utils/` - Data operations and TypeScript interfaces

### Data Model:
The core `Friend` interface includes: id, name, contactMethod, frequencyDays, firstContactDate, lastContactDate. All dates are stored as ISO strings.

### Key Features:
- Custom start dates for first contact
- Predefined and custom frequency intervals
- Backup/restore to JSON files
- Color-coded urgency indicators
- Sort by urgency (overdue first)