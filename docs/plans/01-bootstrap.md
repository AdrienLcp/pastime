# 01 — Bootstrap

Goal: an installable empty PWA, `pnpm validate` green, CI green, served from
`https://recre.adrienlcp.com`. No game code.

## Read first

`toolkit/conventions/README.md`, `tooling.md`, `architecture.md`;
`toolkit/templates/web-app/`. Séance as the PWA reference:
`C:/git/sport/vite.config.ts`, `src/infrastructure/pwa/`,
`src/service-worker/`, its `package.json` scripts and deploy workflow (the
public-demo one, Cloudflare Pages).

## Do

1. Root app from `templates/web-app/` (name `recre`), port **5530**,
   `strictPort`; `.nvmrc`, `.editorconfig`, `.githooks/`, `cspell.json`.
2. `@adrienlcp/*` packages from the template, plus `browser` (wake lock,
   reduced motion) and `safe-storage`.
3. PWA: manifest (name "Récré", standalone, portrait-friendly but not locked),
   placeholder icons until step 02, service worker precaching the build,
   update prompt — copied from Séance's shape.
4. CI: validate on every push; deploy job on `main` to a Pages project
   `recre` (skill `cloudflare-pages` creates it and the secrets), custom domain
   `recre.adrienlcp.com`.

## Done when

- `pnpm validate` passes locally and in CI.
- `pnpm dev` serves on `http://localhost:5530`, seen in a browser.
- The deployed site installs on a phone (or Chrome's install prompt shows) and
  opens offline after a first visit.
