# ShopMate — Storefront

A premium, production-grade e-commerce storefront built with **React 19**, **TypeScript**, **Redux Toolkit**, **React Router**, **Tailwind CSS** and **Vite**.

🔗 **Live:** https://shop-mate-six-azure.vercel.app

---

## Highlights

- 🎨 **Design-token system with dark mode** — semantic tokens for colors, radius, shadows and focus rings, with `prefers-reduced-motion` support. The whole storefront adapts to light/dark.
- 🧭 **Premium-minimal Navbar** — logo mark, desktop nav, cart badge, search overlay, and an **AI Search** entry point wired to the AI search modal.
- 🎠 **Animated HeroSlider** — pill-style CTA, animated indicator dots, navbar-safe spacing.
- 🛍️ **Polished ProductCard** — hover lift, image zoom, lazy loading, rating badges.
- 🤖 **AI-powered product search** — natural-language search (NVIDIA NIM Nemotron with OpenRouter GPT-4o-mini fallback) that turns plain text into structured database filters.
- 💳 **Full commerce flow** — cart with quantity management, multi-step checkout with Stripe Payment Intents, order history with live status polling.
- 🧪 **Tested** — Vitest + Testing Library unit suite (`npm run test`).

## Architecture

```
src/
├── app/               # App shell: Redux store, hooks, router, providers, error boundary
├── components/ui/     # Reusable UI primitives (Button, Input, Modal, Spinner, Badge, ...)
├── config/            # Centralized, typed application configuration
├── features/          # Feature-first modules
│   ├── auth/          # Register / Login / Forgot / Reset / Profile
│   ├── cart/          # Cart state + drawer
│   ├── checkout/      # Multi-step checkout + Stripe
│   ├── home/          # Landing: HeroSlider, category grid, new arrivals
│   ├── marketing/     # Promo sections
│   ├── orders/        # Order history + tracking
│   ├── products/      # Listing, filters, detail pages, reviews, AI search
│   ├── search/        # Search overlay
│   ├── wishlist/      # Wishlist
│   └── layout/        # Navbar, Footer, layout shells
├── hooks/             # Shared custom hooks
├── lib/               # Infrastructure (API client, utilities)
├── types/             # Shared TypeScript types
└── test/              # Unit tests (Vitest)
```

## Structural Highlights

- **Feature-first modules** — every domain owns its components, pages and state
- **Shared UI kit** (`components/ui`) — consistent, accessible primitives
- **Route-level code splitting** — lazy-loaded pages with Suspense
- **Error boundary** — graceful crash recovery instead of a blank page
- **Path aliases** (`@/`) — clean, collision-free imports
- **Centralized config** — no hardcoded API URLs or business rules

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (`http://localhost:5173`) |
| `npm run build` | Production build |
| `npm run lint` | Lint with ESLint |
| `npm run test` | Run the unit test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Environment

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

In production, point `VITE_API_URL` at the deployed backend:

```env
VITE_API_URL=https://shop-mate-backend.vercel.app/api/v1
```

## Deployment

Deployed to Vercel as project **`shop-mate`** → https://shop-mate-six-azure.vercel.app (auto-deploys from the `main` branch).

> Deploying from the CLI? Both Vercel projects have a **Root Directory** setting — see the "Deploying from the CLI" section in the root [`OPERATIONS.md`](../OPERATIONS.md) for the exact flow.
