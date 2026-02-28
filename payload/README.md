# Next.js + Payload E-commerce Starter

Production-ready e-commerce starter built with Next.js 16 and Payload CMS 3.

Clone, configure, and launch your store.

---

## Features

- Full Payload E-commerce CMS integration
- Complete Category → Product → Add to Cart → Checkout → Purchase storefront flow
- Store pickup flow ready
- Aggressive tag-based caching with manual revalidation
- SEO-ready (metadata + JSON-LD + sitemap + robots.txt)
- Analytics & pixels (GA4 / GTag / Meta / TikTok) with built-in conversion tracking (add_to_cart, begin_checkout, purchase)
- Order email confirmation + WhatsApp notification

## Live Preview

**Main Site:**  
https://payload-storefront.vercel.app

**Admin Panel:**  
https://payload-storefront.vercel.app/admin

**Demo Login:**  
Email: `admin@admin.com`  
Password: `admin`

---

## ▲ Deploy Your Own

Deploy your own Payload-powered e-commerce storefront.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yaara-food/payload-ecommerce)

After creating your project, make sure to go to the Vercel dashboard  
and update your environment variables based on [.env.example](.env.example)

---

## Notes on Payload E-commerce

Payload is a powerful CMS, and the e-commerce plugin gives you many features out of the box.

However, in real production use you may need to customize parts of it.

For example:

- Slug field was customized to properly support non-Latin characters.
- Media is served through Payload routes by default (not a CDN), so image caching and TTL control may require extra configuration.
- Some behaviors are opinionated and may require collection overrides.

This starter already includes structural adjustments to make it more production-ready.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **Payload CMS 3** + **PostgreSQL**
- **Tailwind CSS 4** + **React Icons** + **next-intl** + **React Hook Form**
- **pnpm** as package manager (Node >= 22)

### Data Layer, Caching & Revalidation

The project uses a simple DAL (Data Access Layer) abstraction.

You can choose the implementation in:

[`src/lib/core/dal/index.ts`](src/lib/core/dal/index.ts)

- **Api** → Headless REST mode (recommended for production)
- **Queries** → Direct Payload SDK mode (monolith)

Both expose the same public methods.

---

### Caching & Revalidation

- The frontend uses Next.js cache with tag-based revalidation. Products and categories auto-revalidate on save or delete. The storefront is aggressively cached for performance.
- After changing products, categories, layout, footer or sitemap, click **“Revalidate” in Admin → Site Settings** to refresh immediately.
- Draft mode is supported — preview content does not affect the published cache.

### Orders & Notifications

- On order creation, a confirmation email is automatically sent to the customer.
- A WhatsApp notification is sent to the store owner via Callmebot.
- The architecture is ready for store pickup flow.
- Payment gateway integration can be added easily (Stripe, PayPal, etc.) using order hooks.

### Local Development

Clone the repo and start a local PostgreSQL with Docker:

```bash
docker run --name payload-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=payload \
  -p 5442:5432 \
  -v payload_data:/var/lib/postgresql/data \
  -d postgres:17
```

Create a `.env` file based on [`.env.example`](.env.example) and configure your environment variables, then install and run:

```bash
pnpm install
pnpm dev
```

To seed mock data for local development, run the [`seeder script`](seed/seedData.ts):

```bash
pnpm tsx  seed/seedData.ts
```

### Key Directories

- `src/app/(app)/` — Public storefront (home, product, category, checkout, preview)
- `src/app/(payload)/` — Payload admin + API routes
- `src/lib/` — Core app logic (collections, queries, caching, types, utilities, providers, i18n)
- `src/lib/collections/` — Payload CMS collection definitions (Products, Category, Media, Users, Orders, etc.)
- `src/components/` — UI + domain components (cart, checkout, product, layout, shared, ui)
