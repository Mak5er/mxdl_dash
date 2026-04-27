# MaxLoad Dashboard

Public landing page and private operations dashboard for
[`Mak5er/Downloader-Bot`](https://github.com/Mak5er/Downloader-Bot).

MaxLoad is a Telegram media downloader for links from TikTok, Instagram,
YouTube, SoundCloud, Pinterest, and X/Twitter. This dashboard gives the bot a
clean public face with live aggregate stats, plus a protected admin console for
operating the service.

## Highlights

- Public landing page with live totals, charts, FAQ, support links, and
  human-friendly copy.
- SEO-ready public surface with canonical metadata, Open Graph/Twitter cards,
  JSON-LD, sitemap, robots rules, web manifest, and `llms.txt`.
- Private `/admin` console protected by `ADMIN_TOKEN_HASH` and a signed HTTP-only
  session cookie.
- Admin views for users, downloads, analytics events, and individual user
  details.
- Telegram admin messaging from user detail pages through the bot API.
- Production runtime support with standalone Next.js output, Docker, security
  headers, rate limiting, TTL caches, and database query timeouts.
- Public data stays aggregate-only. Raw user records are only available inside
  the admin console.

## Tech Stack

| Area | Tools |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, lucide-react, custom SVG charts |
| Data | PostgreSQL-compatible database access through `pg` |
| Validation | Zod |
| Testing | Vitest, ESLint, TypeScript |
| Runtime | Standalone Next.js server, Docker Compose |

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Public MaxLoad landing page and aggregate live stats |
| `/admin/login` | Admin token login |
| `/admin` | Operational overview |
| `/admin/users` | User table with filters and sorting |
| `/admin/users/[userId]` | User profile, settings, activity, and Telegram message form |
| `/admin/downloads` | Downloaded file records |
| `/admin/events` | Analytics event records |

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

Create `.env` from `.env.example` and fill in real values:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
DASHBOARD_PUBLIC_URL="https://dashboard.example.com"

ADMIN_TOKEN_HASH=
ADMIN_SESSION_SECRET=
TELEGRAM_BOT_TOKEN="123456:telegram-bot-token"

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

Generate a strong admin token, store its SHA-256 hash, and generate a separate session secret:

```bash
node -e "const crypto=require('crypto'); const token=crypto.randomBytes(48).toString('hex'); console.log('token:', token); console.log('ADMIN_TOKEN_HASH='+crypto.createHash('sha256').update(token).digest('hex')); console.log('ADMIN_SESSION_SECRET='+crypto.randomBytes(48).toString('hex'))"
```

For Neon or other managed PostgreSQL providers, keep SSL options in the URL:

```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
```

`DASHBOARD_PUBLIC_URL` is used for canonical metadata, sitemap, robots output,
JSON-LD, and local tunnel hostnames in Next dev. If you expose `npm run dev`
through localhost.run, Cloudflare Tunnel, ngrok, or another hostname, set this
value and restart the dev server.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js dev server |
| `npm run build` | Build standalone production output |
| `npm start` | Run the standalone server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run Vitest tests |

## Docker

```bash
docker compose up -d --build
```

The container listens on port `3000` and reads runtime values from `.env`.

## Database

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

Current schema limitations are handled honestly:

- The `users` table has no creation timestamp, so "new users today / 7d / 30d"
  is shown as unavailable instead of invented.
- `downloaded_files` has no user reference, so user detail pages do not claim
  per-user download history.

## Security And Runtime

- `.env` is ignored by git.
- Standalone build artifacts are cleaned so copied `.env*` files do not ship in
  `.next/standalone`.
- Admin pages and admin API responses use `Cache-Control: no-store`.
- Login and Telegram message actions are rate-limited in memory.
- DB calls use connection, query, statement, and idle transaction timeouts.
- Telegram sends use a request timeout and never log the bot token.
- Security headers include CSP, frame blocking, MIME sniffing protection,
  referrer policy, permissions policy, and disabled `X-Powered-By`.

For multi-instance deployments, replace the in-memory cache and rate limiter
with shared storage such as Redis or Upstash.

## Deployment Notes

For a tunnel or reverse-proxy setup:

1. Run the app privately on `localhost:3000` or a private host port.
2. Point the public hostname at that port.
3. Set `DASHBOARD_PUBLIC_URL` to the public hostname.
4. Keep TLS at the proxy or tunnel edge.
5. Use a long random admin token, store only `ADMIN_TOKEN_HASH`, and keep `ADMIN_SESSION_SECRET` separate.

## Project Assets

- Active app icon: `app/icon.svg`
- Public hero art: `public/maxload-hero.svg`

## Troubleshooting

`DATABASE_URL is not configured.`

Set `DATABASE_URL` in `.env`, Docker Compose `env_file`, or your deployment
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
