# Next.js + Payload E-commerce Starter

Production-ready e-commerce starter built with Next.js 16 and Payload CMS 3.

Clone, configure, and launch your store.

---

## Features

- Full Payload E-commerce CMS integration
- Complete Category → Product → Add to Cart → Checkout → Purchase storefront flow
- Checkout supports store pickup or online payment (Stripe integration included) — enable/switch per store
- Admin dashboard for tracking sales and orders
- Aggressive tag-based caching with manual revalidation
- SEO-ready (metadata + JSON-LD + sitemap + robots.txt)
- Analytics & pixels (GA4 / GTag / Meta / TikTok) with built-in conversion tracking (add_to_cart, begin_checkout, purchase)
- Order email confirmation + WhatsApp notification

## Live Preview

**Main Site:**
https://payload.url-link.org

**Admin Panel:**
https://payload.url-link.org/admin

**Demo Login:**
Email: `admin@admin.com`
Password: `admin`

🔄 Reset Demo Data

If demo data was modified while you or another user were testing, you can restore it to a fresh state by visiting:
https://payload.url-link.org/preview/reset

#### This will reset and reseed the database (media preserved).

---

## ▲ Deploy Your Own

Deploy your own Payload-powered e-commerce storefront.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giladfuchs/next-ecommerce)

After creating your project, make sure to go to the Vercel dashboard
and update your environment variables based on [.env.example](.env.example)

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **Payload CMS 3** + **PostgreSQL**
- **Tailwind CSS 4** + **React Icons** + **next-intl** + **radix-ui** + **React Hook Form**
- **pnpm** as package manager (Node >= 24)

### Data Layer, Caching & Revalidation

The project uses a simple DAL (Data Access Layer) abstraction.

You can choose the implementation in:

[`src/lib/core/dal/Pages.ts`](src/lib/core/dal/index.ts)

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
- At checkout, choose between store pickup or online payment.
- Stripe integration included for online payment. Other gateways can be added the same way via order hooks.

### Local Development

Clone the repo and start a local PostgreSQL with Docker:

```bash
docker run --name payload-ecommerce \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=payload \
  -p 5443:5432 \
  -v payload_ecommerce_data:/var/lib/postgresql \
  -d postgres:18
```

Create a `.env` file based on [`.env.example`](.env.example) and configure your environment variables, then install and run:

```bash
pnpm install
pnpm dev
```

### Seeding Mock Data

To seed mock data for local development:

1. Download the product images from [this Google Drive folder](https://url-link.org/images) and extract them into `seed/data/images`.
2. Run the [seeder script](seed/index.ts):

```bash
   pnpm run seed
```

This will populate your local database with sample products, categories, and orders for development and testing.

### Key Directories

- `src/app/(app)/` — Public storefront (home, product, category, checkout, preview)
- `src/app/(payload)/` — Payload admin + API routes
- `src/lib/` — Core app logic (collections, queries, caching, types, utilities, providers, i18n)
- `src/lib/collections/` — Payload CMS collection definitions (Products, Category, Media, Users, Orders, etc.)
- `src/components/` — UI + domain components (cart, checkout, product, layout, shared, ui)

---

## 🤝 Contributing

Contributions are welcome!  
If you find this project useful, consider giving it a ⭐ on GitHub — it helps others discover it!

To contribute, fork the repository and submit a pull request with your enhancements or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
