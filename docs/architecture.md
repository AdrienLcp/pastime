# Architecture

## No server, nothing to pay

Everything a game needs is computed on the device: levels are generated from a
seed, saves and statistics sit in local storage. The app is static files on
Cloudflare Pages (free: unlimited requests and bandwidth, 500 deploys a month),
served at `pastime.adrienlcp.com`, deployed from `main` by GitHub Actions — the
same flow as the portfolio and Séance's public demo (skill `cloudflare-pages`).
The Pages project is `pastime`, its own host `pastime-2e1.pages.dev` (kept out
of search engines by `public/_headers`); the custom domain is a proxied CNAME
to it. Unknown paths answer 200 with the app, which shows its not-found page.

The **daily puzzle** needs no server either: its seed is the date, so every
player gets the same puzzle on the same day.

## Layout

One app at the repository root (Séance's shape — no workspace needed until a
second app exists):

```
src/
  features/
    hub/              → the game list, daily puzzles, streaks
    game-frame/       → what every game shares: timer, undo, restart, hint,
                        pause, win screen, save/resume
    stars/            → one folder per game:
      engine/           pure rules: state, moves, win check (no React)
      solver/           logical solver, used to grade and to check uniqueness
      generator/        seeded generation, run in a Web Worker
      presentation/     board, cells, gestures
    pipes/, solitaire/, color-dots/ …  same shape
  helpers/
    seeded-random.ts  → the only PRNG: same seed, same sequence, everywhere
  infrastructure/
    storage/          → saves, stats, settings through @adrienlcp/safe-storage
    pwa/              → manifest, service worker registration (from Séance)
```

A game registers itself in one place (id, name, icon, sizes or difficulties,
its engine's entry points); the hub and the frame read that registry and know
nothing else about the game.

## Design

The visual world is « Cahier de jeux », a pocket puzzle book: `DESIGN.md` at
the root is the system, `src/presentation/styles/_tokens.sass` its values.
The example pages from step 02 stay in `.impeccable/directions/` as the
reference for every game step: `cahier/` is the chosen one (hub, a board per
game, win screen, icon); `plaque/` and `grille/` are the rejected
alternatives, kept for the record. They are prototypes with their own inline
code, outside Biome and cspell.

- Colours are `light-dark()` tokens; `@adrienlcp/theme-preference` resolves
  the scheme (the stored choice beats the system) and its Vite plugin stamps
  `data-theme` and the `theme-color` metas before the first paint.
- Fonts are self-hosted woff2 in `public/fonts/`, with fontaine's
  metric-matched fallback faces.
- `Temporal` is polyfilled at the entry where missing
  (`infrastructure/install-temporal.ts`); the day comes from
  `infrastructure/clock.ts`.

## Generation

- Seeded PRNG (one helper), so a level is reproducible from `(game, size,
  difficulty, seed)` — that tuple is also the share code of a level.
- Generators that can take more than a frame run in a Web Worker
  (`?worker` import in Vite), with a timeout and a retry on a new seed.
- A generated level ships only if the solver solves it without guessing; the
  solver's hardest technique used is the level's difficulty.

## Storage

Per game: the game in progress (resumable after the app is killed), best
times per size and difficulty, streak of daily puzzles, settings. Keys are
versioned so a format change migrates or drops cleanly. Export/import of all
data as a file, so changing phone loses nothing.

## PWA

Installable, offline after the first visit, update prompt when a new version
is deployed — copy Séance's `vite-plugin-pwa` + workbox setup
(`C:/git/sport/src/infrastructure/pwa/`, `src/service-worker/`). Screen wake
lock while playing (`@adrienlcp/browser`). Haptics through
`navigator.vibrate` where it exists, off by default with sound.

Dev port: **5530** (`strictPort`).
