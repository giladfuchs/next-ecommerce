# Express E-commerce API 🛒

A lightweight, production-ready e-commerce backend built with **Express**, **TypeORM**, and **PostgreSQL**, written in **TypeScript**.  
Designed to power a Next.js storefront and admin panel — including product management, category structure, cart submission, and order tracking.

---

## 🚀 Getting Started

To run the project locally:

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

### 🛠️ Environment Variables

Create a `.env` file at the root of your project:

```env
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
DB_NAME=your_db_name

# Vercel Blob access (for image uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# JWT secret for authentication
JWT_SECRET=your-secret-key

# CORS and external frontend origin
FRONT_URL=https://your-store.vercel.app
ALLOWED_ORIGINS=https://your-store.vercel.app,http://localhost:3000

SEND_EMAIL_WHATSAPP=false

# Email credentials (for SMTP)
GMAIL_USER=your-gmail@example.com
MAILERSEND_SMTP_USER=your-smtp-username
MAILERSEND_SMTP_PASS=your-smtp-password
STORE_NAME=Your Store Name
STORE_EMAIL=info@example.com

# WhatsApp via CallMeBot
CALLMEBOT_API_KEY=your-callmebot-api-key
WHATSAPP_NUMBER=+1234567890


```

---
