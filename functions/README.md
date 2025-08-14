# ☁️ Next.js Server Mode (with API Routes)

This project supports running backend logic through **Next.js route handlers** (e.g. `/app/api/**`), allowing full backend functionality without a separate Express server.


Useful for:
- 1-click Vercel deploys
- decide use **Next.js server** for both frontend and backend

> These API routes reuse shared backend logic from the `next-ecommerce-backend` package — the same logic used in the Express app.

---
## 📦 Environment Variables

To run the app with Next.js API routes, you must configure environment variables.

> 📄 See [`functions/.env.example`](./.env.example) for full reference and inline comments.

Update the values to match your database, domain, etc.

---

## ⚙️ How It Works

- The backend logic is packaged into `next-ecommerce-backend.tgz` using `pnpm pack`  
  (you run this manually after making changes to `/backend`).

- During root `pnpm build`, we:
    - Copy all route files from `functions/api/` into `app/api/`
    - Copy all frontend files from `frontend/` to the root (`app/`, `components/`, etc.)
  
---

## 🔁 Making Changes to Backend

If you make changes to the backend source code (`/backend`), you must **rebuild the backend package** to apply them to serverless functions.

Before packing, make sure you've installed backend dependencies:

  ```bash
  cd ../backend
pnpm install
  ```
Then run from the root:
  ```bash
  pnpm run pack:backend
  ```

This command will:

- 🔨 Build the backend code
- 📦 Create a `.tgz` archive (`next-ecommerce-backend.tgz`)
- 📥 Install it as a local dependency in the root project

> 🛠️ **Required before `next build`** — otherwise, your updated backend code won’t be included in serverless routes.

---
## ▶️ Run Locally

To start the app with Next.js API routes:
-  Make sure you create a `.env` file in the root and configure it

Run the build command from the root:
  ```bash
pnpm run build
  ```
Start the dev server:
  ```bash
   pnpm exec next dev
  ```


