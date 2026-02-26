# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (port 3344, Turbo)
pnpm build            # Production build
pnpm start            # Run production server
pnpm lint             # ESLint check
pnpm lint:fix         # Fix lint issues
pnpm format           # Prettier formatting
pnpm generate:types   # Regenerate Payload TypeScript types → src/lib/core/types/payload-types.ts
pnpm test:e2e         # Playwright E2E tests
```

Local PostgreSQL (Docker):

```bash
docker run --name payload-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=payload \
  -p 5442:5432 \
  -v payload_data:/var/lib/postgresql/data \
  -d postgres:17
```

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Payload CMS 3** — headless CMS, REST API, admin UI at `/admin`
- **PostgreSQL** via `@payloadcms/db-postgres`
- **Vercel Blob** for media storage (prefix: `payload_ecommerce`)
- **Tailwind CSS 4** + **Radix UI** primitives + **class-variance-authority**
- **next-intl** for i18n
- **Playwright** for E2E tests
- **pnpm** as package manager (Node >= 22)

## Architecture

### Route Groups

- `src/app/(app)/` — public eCommerce frontend (homepage, `/products/[slug]`, `/category/[slug]`, `/checkout`, `/preview`)
- `src/app/(payload)/` — Payload admin panel and REST API routes

### Key Directories

- `src/lib/collections/` — Payload CMS collection definitions (Products, Category, Media, Users, Orders)
- `src/lib/core/` — queries, types, shared utilities
- `src/lib/providers/` — React context providers (cart state, etc.)
- `src/lib/intl/` — i18n configuration
- `src/components/` — React components organized by domain (Cart, checkout, product, layout, shared, ui)

### Data Fetching

All data fetching uses Next.js `unstable_cache` with tags for ISR invalidation. Query functions live in `src/lib/core/` and are named `queryProductBySlug`, `queryAllProducts`, `queryCategoryBySlug`, `querySiteSettings`, `querySitemapData`. Cache is revalidated via Payload collection hooks on save/delete.

### Payload Configuration (`src/payload.config.ts`)

- Collections: Users, Category, Media (+ Orders, Products, Variants, Transactions from eCommerce plugin overrides)
- Globals: SiteSettings (home page content, branding)
- Plugins: `@payloadcms/plugin-ecommerce`, `@payloadcms/plugin-seo`, `@payloadcms/storage-vercel-blob`, custom `fixCartCurrencyUSD`
- TypeScript types auto-generated to `src/lib/core/types/payload-types.ts` — run `pnpm generate:types` after schema changes
- Rich text: Lexical editor

### Path Aliases (tsconfig)

- `@/*` → `./src/*`
- `@payload-config` → `./src/payload.config.ts`

### Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_BASE_URL` — Frontend base URL
- `PAYLOAD_SECRET` — Payload CMS secret
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob auth
- `PREVIEW_SECRET` — Draft mode preview token
- `EMAIL_*` — Brevo SMTP credentials
- `CALLMEBOT_API_KEY` / `WHATSAPP_NUMBER` — WhatsApp order notifications

### Styling Conventions

- Dark mode via `[data-theme="dark"]` selector (not `dark:` class)
- CSS variable-based colors and radius
- Dynamic Tailwind classes from rich text are safelisted in `tailwind.config.mjs`
- Shared utility: `cn()` from `clsx` + `tailwind-merge`

### Orders & Notifications

Order collection hooks send confirmation email (Brevo SMTP) and WhatsApp message (Callmebot) on creation.
