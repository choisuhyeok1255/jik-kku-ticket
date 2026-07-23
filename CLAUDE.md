# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## ⚠️ Next.js version note (read this first)

This repo pins **Next.js 16.2.11** with **React 19.2.4** (App Router). As `AGENTS.md`
warns, this Next.js has breaking changes vs. what you may know — APIs, conventions,
and file layout can differ. Before writing Next-specific code (route handlers, config,
caching directives, metadata), consult `node_modules/next/dist/docs/` rather than
relying on training data, and respect deprecation notices.

## Commands

```bash
npm install       # install deps
npm run dev       # dev server at http://localhost:3000
npm run build     # production build
npm start         # serve production build
npm run lint      # eslint (flat config)
```

There is no test suite in this project.

## Architecture

A single-page KBO ticketing helper: pick a game → see its home team's **booking
vendor** + that vendor's **live server clock** (Naver-navyism-style), so users don't
need a separate clock site for second-precise ticket opens.

The whole app is three moving parts plus one data file:

- **`lib/data.ts`** — the single source of truth. Three maps: `VENDORS` (booking
  sites + the `pingUrl` whose HTTP `Date` header is read for server time), `TEAMS`
  (each home team → its `vendor` + `bookingUrl`), and `GAMES` (sample schedule).
  Editing this file is how you change teams, vendors, and games — nothing else needs
  to change. The data is **sample data**; real deployment means swapping these values.

- **`app/api/server-time/route.ts`** — server-side proxy for vendor time. The browser
  can't read a vendor's response headers directly (CORS), so this route fetches the
  vendor's `pingUrl` server-side (HEAD, falling back to GET), reads the standard
  `Date` response header, and returns `{ serverTime, fetchedAt, ok }`. It is
  `force-dynamic` / `revalidate = 0` (must run at request time, never cached) and
  always returns 200-with-fallback on network failure so the UI never breaks.

- **`components/ServerClock.tsx`** — client component that turns that endpoint into a
  smooth clock. It computes an NTP-style offset (`serverTime − midpoint(t0, t1)` to
  correct for round-trip latency), stores it in a ref, ticks the display every 50ms
  from `Date.now() + offset`, and **re-syncs every 30s**. Precision is ±0.5s because
  the `Date` header is second-granular — fine for ticketing, not for sub-second needs.

- **`app/page.tsx`** — the only screen (`"use client"`). Holds selected-game state,
  derives home/away/vendor from the `lib/data.ts` maps, and renders the hero (match +
  `<ServerClock>` + booking link) and the game list. All display strings are
  KST/`Asia/Seoul` via `Intl.DateTimeFormat`.

### Data flow

`page.tsx` (selected game) → `TEAMS[home].vendor` → `<ServerClock vendor=…>` →
`GET /api/server-time?vendor=…` → vendor `Date` header → offset-corrected clock.

`VendorKey` is the contract tying it together: keys in `VENDORS` must match each
team's `vendor` field, and the API route validates the `?vendor=` param against
`VENDORS` before fetching.

## Conventions

- Path alias `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/lib/data`.
- All user-facing time is formatted in `Asia/Seoul` — keep new time display in KST.
- Styling is plain CSS in `app/globals.css` (no CSS-in-JS / UI library); dynamic
  per-team accents are passed via inline `--home` CSS custom properties.
