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

### 🧪 Initial Data

After your database is ready, you can insert initial categories, products, and user using seed script.

```bash
pnpm tsx scripts/seed.ts
```

- 🧪 For test database (with seed flag):

```bash
SEED=true pnpm tsx scripts/seed.ts
```

📄 For more usage examples, see [`scripts/seed.ts`](./scripts/seed.ts).

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
