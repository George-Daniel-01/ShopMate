# ShopMate — Full-Stack AI-Based E-Commerce Web Application

[![CI](https://github.com/George-Daniel-01/ShopMate/actions/workflows/ci.yml/badge.svg)](https://github.com/George-Daniel-01/ShopMate/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/storefront-deployed-000?logo=vercel)](https://shop-mate-six-azure.vercel.app)
[![Vercel](https://img.shields.io/badge/dashboard-deployed-000?logo=vercel)](https://shop-dashboard-tan.vercel.app)
[![Vercel](https://img.shields.io/badge/backend-deployed-000?logo=vercel)](https://shop-mate-backend.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Stripe](https://img.shields.io/badge/Stripe-integrated-008CDD?logo=stripe)](https://stripe.com)

A complete, production-ready e-commerce platform built with React, Node.js, PostgreSQL, and AI-powered product search. Includes a customer-facing storefront, an admin dashboard, and a REST API backend. The entire codebase is written in **strict TypeScript**.

## ✨ Premium Upgrade Highlights

This codebase recently went through a top-to-bottom premium refactor:

- **Design system** — both frontends now run on a full semantic design-token system (colors, radius, shadows, focus rings) with **dark mode** and a live theme toggle.
- **Storefront polish** — premium-minimal navbar, animated hero slider, product cards with hover lift + image zoom, refined buttons/inputs/badges, and the AI-search entry point wired to the search overlay.
- **Admin dashboard rebuilt** — real React Router nested routes (no more string-based navigation), route-aware breadcrumb header, active sidebar states, and a small UI kit (`Card`, `StatCard`, `Badge`, `Button`, `Input`).
- **Backend layering** — the Stripe webhook was extracted out of `app.ts` into `routes/paymentRoutes.ts` → `controllers/paymentController.ts` → `services/paymentService.ts`, leaving `app.ts` as a thin bootstrap.

---

## Project Structure

```
ShopMate/
├── frontend/                                     # Customer storefront (React 19 + Vite + TS)
├── ecommerce-dashboard-template/                 # Admin dashboard (React 19 + Vite + TS)
└── FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE/   # Node.js API (TS — routes → controllers → services)
```

---

## Features

### Storefront (Customer-Facing)
- Animated hero slider (pill CTA + indicator dots), category grid (pulled live from the backend categories API), new arrivals, and top-rated product sections
- Product listing with filters: category, price range, rating, availability
- AI-powered product search using OpenRouter (GPT-4o-mini)
- Product detail pages with image gallery and customer reviews
- Shopping cart with quantity management
- Multi-step checkout with Stripe payment integration
- User authentication: register, login, forgot/reset password, and **“Continue with Google”** (OAuth 2.0 — one click, no password)
- Profile management: update name, email, avatar, and password
- Order history with real-time status tracking (auto-refreshes every 30s)
- Dark/light theme toggle
- Premium-minimal design system — semantic tokens (colors, radius, shadows, focus rings) with dark-mode support
- Polished product cards with hover lift, image zoom and lazy loading

### Admin Dashboard
- Dashboard with revenue stats, monthly sales charts, order status pie chart, and top product bar chart (Recharts)
- User management: view and delete users with pagination
- Product management: create, update, delete products with multi-image Cloudinary upload (paste / drag & drop / file picker) — including full image replacement when updating
- **Category management**: create, edit, and delete store categories with images; live category dropdown in product forms (no more hardcoded lists)
- Order management: view all orders, update order status, delete orders
- Admin profile and password update
- Premium design system — semantic tokens with dark mode + theme toggle
- Real React Router nested navigation with route-aware breadcrumbs and active sidebar states
- Reusable UI kit: `Card`, `StatCard`, `Badge`, `Button`, `Input`

### Backend API
- JWT authentication with HTTP-only cookies
- Role-based access control (User / Admin)
- PostgreSQL database with auto-table creation on startup
- Cloudinary integration for image storage (products, categories, avatars)
- Stripe payment intents and webhook handling (layered `routes → controllers → services`, webhook extracted out of `app.ts`)
- Password reset via email (Nodemailer)
- AI product search endpoint (NVIDIA NIM Nemotron via OpenRouter-compatible API, OpenRouter GPT-4o-mini fallback)
- Health check endpoint with automatic table creation and schema diagnostics
- Interactive API docs — OpenAPI 3.0 spec served with Swagger UI at `/api/v1/docs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Dashboard | React 19, Vite, Redux Toolkit, Tailwind CSS, **TypeScript** |
| Backend | Node.js, Express.js, **TypeScript** |
| Database | PostgreSQL (via `pg` pool), hosted on Neon |
| Authentication | JWT, bcrypt, HTTP-only cookies |
| Payments | Stripe (Payment Intents + Webhooks) |
| Image Storage | Cloudinary |
| AI Search | NVIDIA NIM (Nemotron 3 Ultra 550B) with OpenRouter (GPT-4o-mini) fallback |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (frontend + backend) |

---

## Getting Started

### Prerequisites
- Node.js v18+
- TypeScript (installed automatically via `npm install`)
- A PostgreSQL database (e.g., [Neon](https://neon.tech))
- Accounts for: Cloudinary, Stripe, OpenRouter, an SMTP email provider

---

### 1. Backend Setup

```bash
cd FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE
npm install
```

Create `config/config.env`:

```env
PORT=4000
DATABASE_URL=your_postgres_connection_string

JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7

CLOUDINARY_CLIENT_NAME=your_cloud_name
CLOUDINARY_CLIENT_API=your_api_key
CLOUDINARY_CLIENT_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth (“Continue with Google”)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=https://shop-mate-backend.vercel.app/api/v1/auth/google/callback

NVIDIA_API_KEY=your_nvidia_nim_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

ADMIN_SECRET_KEY=your_admin_registration_key
```

Available scripts:

```bash
npm run dev      # Start development server with tsx
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled production build
```

Database tables are created automatically on first run.

---

### 2. Frontend (Storefront) Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

```bash
npm run dev
```

Runs on `http://localhost:5173`

---

### 3. Admin Dashboard Setup

```bash
cd ecommerce-dashboard-template
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

```bash
npm run dev
```

Runs on `http://localhost:5174`

---

### 4. Register an Admin Account

Send a POST request to create your first admin:

```http
POST /api/v1/auth/register-admin
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "yourpassword",
  "adminSecretKey": "your_admin_registration_key"
}
```

---

## API Reference

> Interactive documentation: **https://shop-mate-backend.vercel.app/api/v1/docs** (Swagger UI) · raw spec: `/api/v1/docs/swagger.json`

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new user |
| POST | `/register-admin` | — | Register an admin (requires secret key) |
| POST | `/login` | — | Login |
| GET | `/google` | — | Start Google OAuth (redirects to Google consent) |
| GET | `/google/callback` | — | Google OAuth callback (sets JWT cookie, redirects to storefront) |
| GET | `/me` | ✅ | Get current user |
| GET | `/logout` | ✅ | Logout |
| POST | `/password/forgot` | — | Request password reset email |
| PUT | `/password/reset/:token` | — | Reset password |
| PUT | `/password/update` | ✅ | Update password |
| PUT | `/profile/update` | ✅ | Update name, email, avatar |

### Products — `/api/v1/product`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all products (with filters & pagination) |
| GET | `/singleProduct/:id` | — | Get a single product with reviews |
| POST | `/admin/create` | Admin | Create a product (multipart images **or** `imageUrls` JSON array) |
| PUT | `/admin/update/:id` | Admin | Update a product |
| DELETE | `/admin/delete/:id` | Admin | Delete a product |
| PUT | `/post-new/review/:id` | ✅ | Post or update a review (delivered orders only) |
| DELETE | `/delete/review/:id` | ✅ | Delete own review |
| POST | `/ai-search` | ✅ | AI-powered product search |

### Categories — `/api/v1/category`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all categories with images and per-category product counts |
| POST | `/admin/create` | Admin | Create a category (multipart image **or** `imageUrl` string) |
| PUT | `/admin/update/:id` | Admin | Update a category (name / image) |
| DELETE | `/admin/delete/:id` | Admin | Delete a category |

### Orders — `/api/v1/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/new` | ✅ | Place a new order |
| GET | `/orders/me` | ✅ | Get current user's orders |
| GET | `/:orderId` | ✅ | Get a single order |
| GET | `/admin/getall` | Admin | Get all orders |
| PUT | `/admin/update/:orderId` | Admin | Update order status |
| DELETE | `/admin/delete/:orderId` | Admin | Delete an order |

### Admin — `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/getallusers` | Admin | List all users (paginated) |
| DELETE | `/delete/:id` | Admin | Delete a user |
| GET | `/fetch/dashboard-stats` | Admin | Get dashboard statistics |

### Payments — `/api/v1/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/webhook` | — | Stripe webhook (marks orders as paid, reduces stock) |

### Health — `/api/v1/health`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | DB + schema diagnostics (auto-creates missing tables, returns table inventory) |

---

## Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password (hashed), role, avatar (JSONB), reset token |
| `categories` | id, name (unique), image (JSONB), created_at |
| `products` | id, name, description, price, category, stock, images (JSONB), ratings |
| `orders` | id, buyer_id, total_price, tax_price, shipping_price, order_status, paid_at |
| `order_items` | id, order_id, product_id, quantity, price, image, title |
| `shipping_info` | id, order_id, full_name, address, city, state, country, pincode, phone |
| `payments` | id, order_id, payment_type, payment_status, payment_intent_id |
| `reviews` | id, product_id, user_id, rating, comment |

---

## Deployment

All three projects include a `vercel.json` and auto-deploy from the `main` branch:

| App | Live URL |
|---|---|
| Storefront | https://shop-mate-six-azure.vercel.app |
| Admin dashboard | https://shop-dashboard-tan.vercel.app |
| Backend API | https://shop-mate-backend.vercel.app |
| API Docs (Swagger UI) | https://shop-mate-backend.vercel.app/api/v1/docs |

> For CLI deployments (both Vercel projects use a **Root Directory** setting), see the "Deploying from the CLI" section in [`OPERATIONS.md`](./OPERATIONS.md).

**Backend** — set all environment variables from `config.env` in your Vercel project settings.

**Frontend & Dashboard** — set `VITE_API_URL` to your deployed backend URL, e.g.:
```
VITE_API_URL=https://your-backend.vercel.app/api/v1
```

For Stripe webhooks in production, register your deployed backend URL in the Stripe dashboard:
```
https://your-backend.vercel.app/api/v1/payment/webhook
```

---

## Key Implementation Notes

- **TypeScript**: All three projects use strict TypeScript with full type coverage across components, Redux slices, API handlers, and database queries.
- **Currency**: Prices are stored internally as numeric values. It is up to the frontend to display the appropriate currency symbol.
- **Reviews**: Users can only review products from orders with status `Delivered`.
- **Stock**: Automatically decremented when a Stripe `payment_intent.succeeded` webhook is received. Products can be created/updated with `stock: 0` (out of stock).
- **Google Sign-In**: users authenticate with one click via `/api/v1/auth/google`. Existing accounts are linked by email; new users get a generated password (password login stays disabled for them). The OAuth client must be created in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with the authorized redirect URI set to `GOOGLE_REDIRECT_URI`.
- **AI Search**: Extracts search parameters from natural language via the same NVIDIA NIM API used by the GenericAgent stack (Nemotron 3 Ultra 550B), with OpenRouter GPT-4o-mini as automatic fallback, then filters the database with the structured query.
- **Image uploads**: Handled via `express-fileupload` with temp files; uploaded directly to Cloudinary. Product and category endpoints also accept plain image URLs (`imageUrls` / `imageUrl`) for quick seeding.
- **Categories**: Products reference categories by name (string column); the dashboard dropdown and storefront grid are populated from the categories API.

---

## License

This project is for personal and portfolio use. All rights reserved by the author.

---

## Author

**Daniel George**
Lagos, Nigeria
georgeabiamakadaniel@gmail.com







