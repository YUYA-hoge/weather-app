# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is currently configured.

## Language

必ず日本語で回答してください。

## 実装するコードについて
もし、既存のコードがあったら、その書き方をベースに実装してください。
そしたら、私が書いたコードと似ててわかりやすくなるので。

## Required Environment Variables

Create `.env.local` with the following:

```
APIKEY=                  # OpenWeatherMap API key
SUPABASE_URL=            # Supabase project URL
SUPABASE_ANON_KEY=       # Supabase anon/public key
GOOGLE_CLIENT_ID=        # Google OAuth client ID
GOOGLE_CLIENT_SECRET=    # Google OAuth client secret
AUTH_SECRET=             # NextAuth secret (generate with: npx auth secret)
NEXT_PUBLIC_SITE_URL=    # Base URL (e.g., http://localhost:3000)
```

## Architecture

This is a Next.js 16 App Router weather app with Google OAuth authentication via **Auth.js v5 (next-auth@beta)**.

**Authentication flow** (`auth.ts` → `app/api/auth/[...nextauth]/route.ts`):

- `auth.ts` at the project root is the single source of truth — exports `handlers`, `signIn`, `signOut`, `auth`
- Server components call `auth()` directly to get the session and redirect unauthenticated users
- Client components use `next-auth/react` (e.g., `signOut`) — never import from `@/auth` in client components

**Page routing:**

- `/` — Login page (`app/page.tsx`): redirects to `/home` if already authenticated
- `/home` — Main weather page (`app/home/page.tsx`): protected, shows weather search
- `/mypage` — Profile page (`app/mypage/page.tsx`): protected, currently a placeholder

**API routes** (all under `app/api/`):

- `/api/weather?city=<name>` — Fetches weather by city name from OpenWeatherMap
- `/api/weather/current?lat=<lat>&lon=<lon>` — Fetches weather by GPS coordinates
- `/api/city` — Fetches list of cities from Supabase `cities` table (used to populate the search autocomplete); fetched server-side in `/home` with 1-hour revalidation

**Component structure** (`components/`):

- `index.tsx` re-exports all shared components
- `ButtonAppBar` — MUI AppBar; accepts optional `user` prop; shows logout button and avatar (clicking avatar navigates to `/mypage`) when user is logged in
- `WeatherSection` — Client component managing all weather search state; receives `initialCities` from the server
- `CityInput` — MUI Autocomplete for city selection
- `sign-in.tsx` — Server/client sign-in button using `signIn` from `@/auth`

**Styling:** Tailwind CSS v4 + MUI v7. The root layout wraps everything in `AppRouterCacheProvider` (from `@mui/material-nextjs`) to prevent MUI/SSR style mismatches. The `@/*` path alias maps to the project root.
