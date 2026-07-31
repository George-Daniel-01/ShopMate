# ShopMate Storefront

A modern e-commerce storefront built with **React 19**, **TypeScript**, **Redux Toolkit**, **Tailwind CSS** and **Vite**.

## Architecture

```
src/
├── app/               # App shell: Redux store, hooks, router, providers, error boundary
├── components/ui/     # Reusable UI primitives (Button, Input, Modal, Spinner)
├── config/            # Centralized, typed application configuration
├── features/          # Feature-first modules (auth, cart, checkout, products, ...)
│   └── <feature>/
│       ├── components/       # Feature-specific components
│       ├── pages/            # Route-level pages
│       └── <feature>Slice.ts # Feature Redux slice
├── hooks/             # Shared custom hooks
├── lib/               # Infrastructure (API client, utilities)
├── types/             # Shared TypeScript types
└── test/              # Unit tests
```

## Highlights

- **Feature-first modules** — every domain owns its components, pages and state
- **Shared UI kit** (`components/ui`) — consistent, accessible primitives
- **Route-level code splitting** — lazy-loaded pages with Suspense
- **Error boundary** — graceful crash recovery instead of a blank page
- **Path aliases** (`@/`) — clean, collision-free imports
- **Centralized config** — no hardcoded API URLs or business rules

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint with ESLint |
| `npm run test` | Run unit tests (Vitest) |
