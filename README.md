# Game Uber

Team web app built with **React**, **Vite**, **Tailwind CSS**, and **PWA** support.

## Prerequisites

- [Node.js](https://nodejs.org/) **20+** (see `.nvmrc` if you use [nvm](https://github.com/nvm-sh/nvm))

## Getting started

```bash
# Install dependencies (run after every git pull that changes package-lock.json)
npm install

# Start dev server with hot reload (http://localhost:5173)
npm run dev

# Build shared CSS for html/ prototype pages (also runs before npm run build)
npm run build:css

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Tech stack

| Tool | Role |
|------|------|
| [Vite](https://vite.dev/) | Dev server and production bundler |
| [React](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Typed JavaScript |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling (`src/index.css`) |
| [React Router](https://reactrouter.com/) | Client-side routes and shared layout |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service worker, manifest, installable app |

## Project layout

```
public/              Static assets (favicon, PWA icons)
html/                Static prototype screens (reference while building React)
  boardlink.css      Generated Tailwind output — run `npm run build:css` after token/class changes
src/
  App.tsx            Routes
  components/        Reusable UI (e.g. BottomNav)
  layouts/           AppLayout wraps pages with shared chrome
  pages/             One file per screen (migrate from html/)
  main.tsx           React entry point
  index.css          Tailwind for the React app
  html.css           Tailwind input for html/ prototypes (reference only)
tailwind.config.ts   Shared BoardLink design tokens
index.html           Vite/React entry shell
vite.config.ts       Vite, Tailwind, and PWA plugins
```

### Viewing `html/` prototypes

Open any file in `html/` in the browser (e.g. `html/dashboard.html`). Pages link to `boardlink.css` in the same folder. After you change `tailwind.config.ts`, `src/html.css`, or classes in the HTML files, run:

```bash
npm run build:css
```

## PWA notes

- The app registers a service worker on build (and in dev via `devOptions.enabled`).
- Replace `public/pwa-192x192.png` and `public/pwa-512x512.png` with your real app icons before release.
- To test installability: run `npm run build` then `npm run preview`, open in Chrome, and use **Install app** (or Application → Manifest in DevTools).

## Team workflow

1. Pull latest `main` (or your team branch).
2. Run `npm install` if `package-lock.json` changed.
3. Run `npm run dev` and work in `src/`.
4. Commit source files; do **not** commit `node_modules/` or `dist/` (already in `.gitignore`).
