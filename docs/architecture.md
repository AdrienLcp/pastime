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

## A game, as the frame sees it

`features/game-frame/` owns everything games share; it was proven on a
placeholder game before Stars, the first real one, took its place. A game hands it two things:

- **A definition** (`<game>-definition.ts`), light and loaded with the hub:
  name and rule keys, chapter ink, variants and the daily one (or a
  `dailyOnlyVariant` free play never offers, Color Dots' boss), its glyph,
  and `load()`, a dynamic import of the rest. `game-registry.ts` lists them.
- **A module** (`<game>-module.ts`), loaded with the game's page and sealed by
  `sealGameModule`: the pure `GameEngine` (`start`, `applyMove`, `isWon`,
  `hint`, the level and move schemas, and `isLost` for a game a wrong move
  ends — the frame then locks the board and offers undo or restart), the
  `Board` component, the hint's sentence key, and `createGeneratorWorker` — a
  `?worker` import whose script calls `serveGenerator(generate)`. A generator
  gets the puzzle's number with its seed, for a numbered progression.

The seal keeps a game's four types (level, state, move, hint) together inside
one value, so the registry holds games of different types and a board is only
ever handed its own engine's state. `applyMove` and a generator answer
`Result<{ board }>` / `Result<{ level }>`: `Result` over a bare type parameter
does not narrow to its `data`.

The route loader (`game-loader.ts`) resumes the saved game or prints the next
puzzle, then the page plays it (`use-play-session.ts`): every move is saved
(level, moves, time), undo keeps every board, the clock counts only while the
puzzle is in front of the player, and hiding the page pauses it.

A puzzle is `(game, variant, number)`: free play numbers count up per variant
(`nextNumber` in the play record), the daily's number is the issue — days since
1 January 2026, plus one — and its seed the game and the date.

## Generation

- Seeded PRNG (one helper), so a level is reproducible from its puzzle
  `(game, variant, number)` — the share code of a level.
- Generators that can take more than a frame run in a Web Worker
  (`?worker` import in Vite), with a timeout and a retry on a new seed.
- A generated level ships only if the solver solves it without guessing.
  How hard it is depends on the game: Stars asks for a hardest technique per
  variant, Color Dots keeps the board with the most traps, Pipes and
  Solitaire are not graded — a board's size is its difficulty.

## Storage

Every key starts with `pastime.` and carries its version
(`pastime.saved-game.v1.<game>.<mode>`, `pastime.play-record.v1`,
`pastime.play-settings.v1`), and each is read through its zod schema: a value
the app no longer understands reads as absent. One game in progress waits per
game and mode; the play record holds, per game, the best time, solved count and
next number per variant, and each daily solved by its day — the streak counts
days with any daily solved. The backup file carries every `pastime.*` entry
raw, so a key added later is in it without a change; a restore replaces them
all and reloads.

## PWA

Installable, offline after the first visit, update prompt when a new version
is deployed — copy Séance's `vite-plugin-pwa` + workbox setup
(`C:/git/sport/src/infrastructure/pwa/`, `src/service-worker/`). Screen wake
lock while playing (`@adrienlcp/browser`). Haptics through
`navigator.vibrate` where it exists, off by default with sound.

Dev port: **5530** (`strictPort`).

## Measuring

Lighthouse's mobile figures are Lantern's simulation, and Lantern models only
HTTP/2 as multiplexed: a run Chrome happens to make over HTTP/3, which
Cloudflare offers, is simulated as one connection per request and reads about
1.1 s slower on LCP, with nothing different on the page. So the production
site is measured with QUIC off —
`--chrome-flags="--headless=new --mute-audio --disable-quic"` — and judged on
the median of three runs, the portfolio's gate: mobile LCP ≤ 2800 ms,
performance ≥ 85.
