# Next.js E-commerce Frontend 🛍️

A modern, accessible e-commerce storefront built with **Next.js 14**, **TypeScript**, **MUI**, and **Tailwind CSS** — styled primarily with MUI, extended with Tailwind utilities.  
Includes a full admin dashboard, product editor, order management, and support for both **mock mode** and **real API** connections.

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

## 🧪 E2E Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end tests of both the storefront and admin panel.

### Run tests locally:

Make sure your dev server is already running on port **3000**,  
and that you’ve set up a test database with user and seed data  
(see `backend/scripts` for setup instructions), then run:

```bash
pnpm test
```

This will:

- Start a temporary **frontend test instance** on port **3001**
- Start a temporary **backend test instance** on port **4013**
- Run the **Playwright test suite** in **headed mode**
- Exit after tests complete

 

---

## 📁 Structure Overview

```

app/
├── admin/          → Admin panel (model-based)
├── checkout/       → Checkout flow
├── category/       → Category pages
├── product/        → Product detail pages

components/
├── admin/          → AG Grid Table, Model forms
├── cart/           → Index modal and UI
├── checkout/       → Checkout info and summary
├── layout/         → Header, Footer
├── product/        → Product display, gallery, cards
├── shared/         → Loading, messages, accessibility

lib/
├── api/            → API helpers (catalog, orders, uploads)
├── store/          → Redux store and slices
├── types/          → Shared TypeScript types
├── assets/         → Static config like i18n translations, SEO
```


 