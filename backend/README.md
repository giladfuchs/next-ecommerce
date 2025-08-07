# Express E-commerce API 🛒

A lightweight, production-ready e-commerce backend built with **Express**, **TypeORM**, and **PostgreSQL**, written in **TypeScript**.  
Designed to power a Next.js storefront and admin panel — including product management, category structure, cart submission, and order tracking.

---

## 🚀 Getting Started

To run the project locally:

- Make sure you create a .env file in based on [`.env.example`](.env.example)

- Install dependencies:

  ```bash
  pnpm install
  ```

- Start the development server:

  ```bash
  pnpm dev
  ```

---

### 🧰 Database Setup

This project requires a PostgreSQL database.

You have a few options:

- 📦 **Local PostgreSQL**  
  Use the provided Docker config at:
  [`backend/tests/docker-postgres.test.yml`](./tests/docker-postgres.test.yml)

  You can copy and adapt it for your own local setup (the original is intended for testing).

- ☁️ **Supabase (Free Option)**  
  You can create a free hosted database using [supabase.com](https://supabase.com).

---

### 🧪 Dev & Maintenance Scripts

After your database is ready, you can run various helper scripts to seed, back up, or test functionality.

### 🛠 [`dev_db_tools.ts`](./scripts/dev_db_tools.ts)

Developer tool for local DB testing. This script can:

- Export current DB to `scripts/mock-data.json` (in format for mock mode)
- Create a test admin user
- Reset or delete specific tables

```bash
pnpm tsx scripts/dev_db_tools.ts
```

- 🧪 For test database (with seed flag):

```bash
SEED=true pnpm tsx scripts/dev_db_tools.ts
```

### 🗃️ [`make_backup.ts`](./scripts/make_backup.ts)

Backup script for real DB (not for seeding). This script will:

- Export products, categories, and orders to `backup/db_data.json`
- Download all product images into `backup/images/`
- Save image mapping to `backup/image-mapping.json`
- Zip the full backup folder with a timestamp

```bash
pnpm tsx scripts/make_backup.ts
```
### 📩 [`test_order_notifications.ts`](./scripts/test_order_notifications.ts)

Test script for order notification flow (email + WhatsApp). This script will:

- Send customer confirmation email
- Send admin WhatsApp notification

 
```bash
pnpm tsx scripts/test_order_notifications.ts
```

- 🧪 For test database (with seed flag):

```bash
SEED=true pnpm tsx scripts/test_order_notifications.ts
```
---

## ✅ Running Tests

The backend uses [Vitest](https://vitest.dev/) and [Supertest](https://github.com/visionmedia/supertest) to test all API routes.

To run the full test suite:

```bash
pnpm test
```

- Or, use the convenience shell script:

```bash
./tests/run_test.sh
```

---
