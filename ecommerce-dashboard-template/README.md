# ShopMate — Admin Dashboard

The premium admin console for the **ShopMate** e-commerce platform. Built with **React 19**, **TypeScript**, **Redux Toolkit**, **React Router**, **Tailwind CSS**, **Recharts** and **Vite**.

🔗 **Live:** https://shop-dashboard-tan.vercel.app

---

## Highlights

- 🎨 **Full design-token system** — semantic color, radius, shadow and focus-ring tokens defined in `src/index.css` + `tailwind.config.js`, with **dark mode** and a live theme toggle. No hardcoded grays anywhere — every screen adapts to both themes.
- 🧭 **Real routing** — the admin panel uses true **React Router nested routes** (`DashboardLayout` + `Outlet`) instead of string-based navigation. The sidebar is a `NavLink` nav with active states, and the header breadcrumb (`Admin / <section>`) is derived from the current route.
- 🧩 **UI kit** — a small, consistent set of primitives under `src/components/ui/`: `Card`, `StatCard`, `Badge`, `Button`, `Input`, plus a `cn()` class-merge utility.
- 🔐 **Authentication flow** — Login, Forgot Password and Reset Password pages wired to the backend auth API; admin-only areas are role-guarded.
- 📊 **Analytics** — revenue KPIs, monthly sales chart, order-status breakdown and top-products chart built with **Recharts**, icons via **lucide-react**.

## Sections

| Route | Description |
|---|---|
| `/` | Dashboard — KPIs, revenue chart, order-status breakdown, top products |
| `/users` | User management — list and delete (paginated) |
| `/products` | Product management — create, update, delete with Cloudinary multi-image upload |
| `/categories` | Category management — create, edit, delete with images |
| `/orders` | Order management — view all orders, update status, delete |
| `/profile` | Admin profile + password update |

## Architecture

```
src/
├── app/                 # Redux store + slices (auth, theme, extra, ...)
├── components/ui/       # UI kit primitives (Card, StatCard, Badge, Button, Input)
├── features/            # Feature-first modules
│   ├── auth/            # Login / Forgot / Reset pages
│   ├── dashboard/       # Analytics dashboard page
│   ├── layout/          # DashboardLayout, SideBar, Header (breadcrumb + theme toggle)
│   ├── products/        # Products list + create/update modals
│   ├── categories/      # Categories management
│   ├── orders/          # Orders list + status updates
│   ├── users/           # User management
│   └── profile/         # Profile & password pages
├── lib/                 # API client, utilities
└── types/               # Shared TypeScript types
```

## Design System

- **Tokens** live as CSS variables in `src/index.css` (e.g. `--primary`, `--background`, `--muted`, `--radius`) and are surfaced to Tailwind via `tailwind.config.js` (`colors`, `borderRadius`, `boxShadow`).
- **Dark mode** uses the `class` strategy — a theme slice toggles the `dark` class on `<html>`, which swaps the token values.
- **Semantic classes only** — components use `bg-background`, `text-foreground`, `border-border`, `bg-primary text-primary-foreground`, etc., so every view follows the theme automatically.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (`http://localhost:5174`) |
| `npm run build` | Production build (`vite build`) |
| `npm run lint` | Lint with ESLint |
| `npm run preview` | Preview the production build |

## Environment

Create `.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

In production, point `VITE_API_URL` at the deployed backend:

```env
VITE_API_URL=https://shop-mate-backend.vercel.app/api/v1
```

## Deployment

Deployed to Vercel as project **`shop-dashboard`** → https://shop-dashboard-tan.vercel.app (auto-deploys from the `main` branch).

> Deploying from the CLI? Both Vercel projects have a **Root Directory** setting — see the "Deploying from the CLI" section in the root [`OPERATIONS.md`](../OPERATIONS.md) for the exact flow.
