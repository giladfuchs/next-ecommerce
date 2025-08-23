# Next.js E-commerce Template 🛍️

A modern, accessible e-commerce platform built with Next.js 15 (frontend) and Express + PostgreSQL (backend), designed for both customers and store administrators.
<br/>Includes a dynamic storefront, full admin dashboard, backend API, image upload, order tracking, and multilingual support (RTL & LTR).

---

## 🌐 Live Preview

This project uses a mixed mock dataset of **Hebrew (RTL)** and **English (LTR)** product and category entries.  
The layout is fully optimized for both directions, ensuring a seamless multilingual experience.

- **🇺🇸 LTR (English):** [modern-ecommerce-store.vercel.app/en](https://modern-ecommerce-store.vercel.app/en)
- **🇮🇱 RTL (Hebrew):** [modern-ecommerce-store.vercel.app/he](https://modern-ecommerce-store.vercel.app/he)
- **🔐 Admin Panel:** [modern-ecommerce-store.vercel.app/admin](https://modern-ecommerce-store.vercel.app/admin) — includes a built-in login form

---

## ▲ Deploy Your Own

Deploy your own version of this e-commerce storefront.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giladfuchs/next-ecommerce)

This deploy uses Next.js route handlers (app/api) as the server.<br/>
After creating your project, make sure to go to the Vercel dashboard  
and update your environment variables based on [functions/.env.example](functions/.env.example)



---
## 📦 Environment Variables

To run the app locally or in production, you must configure the appropriate environment variables.

See the example files for full variable lists and inline comments:

- [`frontend/.env.example`](frontend/.env.example) — for frontend mode
- [`functions/.env.example`](functions/.env.example) — for Next.js API routes & Frontend
- [`backend/.env.example`](backend/.env.example) — for Express backend mode

---

## 🚀 Getting Started (for Local Development)

This project supports multiple development modes:

- **Fullstack** — run a real backend with PostgreSQL + Express
- **Next.js API** — use serverless functions instead of Express
- **Mock** — use local mock data for instant setup

Choose the guide that fits your workflow:

- [🛍️ `frontend/README.md`](frontend/README.md) — run the frontend with mock data or connect to a backend
- [🛠️ `backend/README.md`](backend/README.md) — set up the Express API and database
- [⚙️ `functions/README.md`](functions/README.md) — uses Next.js API routes for backend logic (no separate server needed)
---

## ✨ Key Features

### 🧑‍💻 Frontend (`/frontend`)

- 💅 Fully styled with **MUI v7**
- 🛍️ Dynamic storefront with product filtering and category browsing
- 🧾 **Admin dashboard** with full model management (products, categories, orders, images)
- 🧠 SEO & Open Graph via **Next.js 15 Metadata API**
- ♿ **Accessibility bar** with font scaling and contrast settings
- 🛒 **Cart and admin state managed via Redux Toolkit** with **persisted state**
- 🧪 **Playwright-based E2E tests** for key storefront and admin flows

### 🔌 Backend (`/backend`)

- 🔄 RESTFUL CRUD API for products, categories, orders, and images
- 🔐 Token-based authentication using **JWT**
- 🗃️ **TypeORM + PostgreSQL** schema design
- 📤 Image upload via **Vercel Blob** + processing with **Multer + Sharp**
- ✉️ Optional: email and WhatsApp order notifications
- ✅ **100% test coverage** for API routes using **Vitest + Supertest**

---

## 🧩 Tech Stack

### Frontend

- **Next.js 15**, **React 19**, **TypeScript**
- **MUI 7**
- **Redux Toolkit** with **redux-persist**
- **AG Grid**, **Formik**, **Yup**, **react-intl**, **Sonner**
- **Playwright** for E2E testing

### Backend

- **Express.js** + **TypeScript**
- **TypeORM** with **PostgreSQL**
- **JWT** + **bcryptjs** for authentication
- **Multer** + **Sharp** for image upload & processing
- **Vercel Blob** for cloud storage
- **Nodemailer**, **SendGrid**, **CallMeBot** for notifications
- **Vitest** + **Supertest** for full API test coverage

---
## 🤝 Contributing

Contributions are welcome!  
If you find this project useful, consider giving it a ⭐ on GitHub — it helps others discover it!

To contribute, fork the repository and submit a pull request with your enhancements or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
