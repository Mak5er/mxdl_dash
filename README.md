# MaxLoad Dashboard

Production dashboard for the `Mak5er/Downloader-Bot` Telegram downloader bot.
It reads the bot's PostgreSQL-compatible database directly and exposes a public
aggregate dashboard plus a private admin console.

## What It Does

- Public `/` dashboard with aggregate-only telemetry: downloads, users, events,
  file types, top actions, and 30-day activity charts.
- Admin `/admin` console protected by `ADMIN_TOKEN` and a signed HTTP-only
  session cookie.
- Admin tables for users, downloads, and analytics events with filtering,
  pagination, sorting, and copy actions.
- User detail pages with profile/settings/activity history and a protected
  Telegram `sendMessage` action.
- Production-oriented runtime: standalone Next.js output, Docker support,
  security headers, TTL caches, rate limiting, query timeouts, and no fake stats.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL access through `pg`
- Zod validation
- Recharts for dashboard charts
- Vitest for focused unit coverage

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

For a production-style local run:

```bash
npm run build
npm start
```

`npm start` runs the standalone server, loads the root `.env`, defaults to
`HOSTNAME=0.0.0.0`, and stops an older local Next process on the same `PORT`
before starting.

## Environment

Create `.env` from `.env.example` and fill in the real values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
DASHBOARD_PUBLIC_URL="https://dashboard.example.com"

ADMIN_TOKEN="PASTE_A_64_PLUS_CHARACTER_RANDOM_SECRET_HERE"
TELEGRAM_BOT_TOKEN="PASTE_BOT_TOKEN_HERE"

PUBLIC_DASHBOARD_CACHE_TTL_SECONDS=20
ADMIN_DASHBOARD_CACHE_TTL_SECONDS=5
PUBLIC_DASHBOARD_AUTO_REFRESH_SECONDS=30
ADMIN_DASHBOARD_AUTO_REFRESH_SECONDS=10

RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_MAX_BUCKETS=5000

DATABASE_POOL_MAX=8
DATABASE_QUERY_TIMEOUT_MS=15000
DATABASE_STATEMENT_TIMEOUT_MS=15000
DATABASE_IDLE_TRANSACTION_TIMEOUT_MS=15000
```

Generate a strong admin token:

```bash
openssl rand -hex 64
```

For Neon or other managed Postgres providers, keep SSL options in the URL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

`DASHBOARD_PUBLIC_URL` is the public hostname for metadata and local tunnel
development. If you expose `npm run dev` through localhost.run, Cloudflare
Tunnel, ngrok, or another hostname, set this value and restart the dev server.

## Scripts

```bash
npm run dev        # local Next dev server
npm run build      # standalone production build
npm start          # run the standalone server
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Vitest
```

## Docker

```bash
docker compose up -d --build
```

The container listens on `3000` and reads runtime values from `.env`.

## Database Notes

The dashboard expects the existing Downloader-Bot schema:

- `users`
- `settings`
- `downloaded_files`
- `analytics_events`

Recommended additive indexes live in
[`docs/recommended-indexes.sql`](docs/recommended-indexes.sql):

```bash
psql "$DATABASE_URL" -f docs/recommended-indexes.sql
```

## Favicon Options

The active app icon lives at `app/icon.svg`. The selected source variant is
kept at `public/favicon-options/maxload-icon-09.svg`.

Current schema limitations are handled explicitly:

- The `users` table has no creation timestamp, so "new users today / 7d / 30d"
  is shown as unavailable instead of invented.
- `downloaded_files` has no user reference, so user detail pages do not claim
  per-user download history.

## Security And Runtime

- Secrets are server-only: `.env` is ignored by git and removed from standalone
  build artifacts after `next build`.
- Public pages never expose raw user records.
- Admin routes and admin API responses use `Cache-Control: no-store`.
- Admin login and Telegram sends are rate-limited in memory.
- DB queries have connection, query, statement, and idle transaction timeouts.
- Telegram sends use a request timeout and never log the bot token.
- Security headers include CSP, frame blocking, MIME sniffing protection,
  referrer policy, permissions policy, and disabled `X-Powered-By`.

For multi-instance production, replace the in-memory TTL cache and rate limiter
with shared storage such as Redis or Upstash.

## Deployment Notes

For a tunnel/reverse-proxy setup:

1. Run the app privately on `localhost:3000` or a private host port.
2. Point the public hostname at that port.
3. Set `DASHBOARD_PUBLIC_URL` to the public hostname.
4. Keep TLS at the proxy/tunnel edge.
5. Use a long random `ADMIN_TOKEN`.

## Troubleshooting

`DATABASE_URL is not configured.`

Set `DATABASE_URL` in `.env`, Compose `env_file`, or the deployment
environment.

`The database is unavailable.`

Check credentials, network access, SSL requirements, and whether the expected
bot tables exist.

Telegram messages fail.

Confirm `TELEGRAM_BOT_TOKEN`, make sure the target user has started the bot,
and check server logs.

Public tunnel URL does not work but localhost does.

Verify the tunnel process is running and points to `http://localhost:3000`.
If using `npm run dev`, also set `DASHBOARD_PUBLIC_URL` and restart Next so the
hostname is included in `allowedDevOrigins`.
