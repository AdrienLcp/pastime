# Architecture

## No server, nothing to pay

Everything a game needs is computed on the device: levels are generated from a
random seed, saves and statistics sit in local storage. The app is static files on
Cloudflare Pages (free: unlimited requests and bandwidth, 500 deploys a month),
served at `pastime.adrienlcp.com`, deployed from `main` by GitHub Actions — the
same flow as the portfolio and Séance's public demo (skill `cloudflare-pages`).
The Pages project is `pastime`, its own host `pastime-2e1.pages.dev` (kept out
of search engines by `public/_headers`); the custom domain is a proxied CNAME
to it. Unknown paths answer 200 with the app, which shows its not-found page.

## Layout

One app at the repository root (Séance's shape — no workspace needed until a
second app exists):

```
src/
  features/
    hub/              → the list of games
    game-frame/       → what every game shares: the choice of variant, timer,
                        undo, new game, hint, pause, win screen,
                        save/resume, the level printed ahead
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
  (`infrastructure/install-temporal.ts`); the backup file's day comes from
  `infrastructure/clock.ts`.

## A game, as the frame sees it

`features/game-frame/` owns everything games share; it was proven on a
placeholder game before Stars, the first real one, took its place. A game hands it two things:

- **A definition** (`<game>-definition.ts`), light and loaded with the hub:
  name and rule keys, chapter ink, its variants — sizes, deals or
  difficulties, the first one the default — its glyph, and `load()`, a
  dynamic import of the rest. `game-registry.ts` lists them.
- **A module** (`<game>-module.ts`), loaded with the game's page and sealed by
  `sealGameModule`: the pure `GameEngine` (`start`, `applyMove`, `isWon`,
  `hint`, the level and move schemas, and `isLost` for a game a wrong move
  ends — the frame then locks the board and offers undo or a new game), the
  `Board` component, the hint's sentence key, and `createGeneratorWorker` — a
  `?worker` import whose script calls `serveGenerator(generate)`. A generator
  gets a seed and a variant, nothing else.

The seal keeps a game's four types (level, state, move, hint) together inside
one value, so the registry holds games of different types and a board is only
ever handed its own engine's state. `applyMove` and a generator answer
`Result<{ board }>` / `Result<{ level }>`: `Result` over a bare type parameter
does not narrow to its `data`.

A game has one page, `/:locale/:game`, and the hub links straight to it: its
loader (`game-loader.ts`) resumes the saved game, else takes the level printed
ahead for the preferred variant, else prints one. The preferred variant is the
one last started, kept in the play record, else the definition's
`defaultVariantId`, in the middle of the range; launch prints ahead for the
same one. The page then plays it
(`use-play-session.ts`): every move is saved (level, moves, time), undo keeps
every board, the clock counts only while the puzzle is in front of the player,
and hiding the page pauses it. Another variant is picked in the tools
(`variant-panel.tsx`), which records it as preferred and runs the loader
again in place, as the new-game tool and the win sheet's new game do. Back
leaves for the list of games. The retired `/:locale/:game/play`, which an
installed app may still hold, redirects to the game.


A puzzle is `(game, variant, seed)`: a new level's seed is 32 random bits,
kept in the save so a resumed game prints the same board.

## Generation

- Seeded PRNG (one helper), so a level is reproducible from its seed.
- Generators run in a Web Worker (`?worker` import in Vite), with a timeout
  and a retry on a seed derived from the first.
- **One level ahead per variant, so a new game never waits.** Once a level is
  on screen, the next one of the same variant is printed in the worker when
  the page is idle (`print-ahead.ts`) and kept in storage; a new game takes
  it at once and the next is printed behind it. At launch, each game's
  preferred variant is printed ahead the same way, one game after another. A
  variant opened for the first time, with nothing waiting, is printed live.
  Most levels take under 100 ms, the slowest about 2 s on a mid-range phone,
  and a game lasts minutes: one level ahead is never empty.
- A generated level ships only if the solver solves it without guessing.
  How hard it is depends on the game: Stars asks for a hardest technique per
  variant, Color Dots keeps the board with the most traps, Pipes and
  Solitaire are not graded — a board's size is its difficulty.

## Storage

Every key starts with `pastime.` and carries its version
(`pastime.saved-game.v2.<game>`, `pastime.play-record.v1`,
`pastime.play-settings.v1`, `pastime.next-level.v1.<game>.<variant>`), and
each is read through its zod schema: a value the app no longer understands
reads as absent. One game in progress waits per game (the `v1` saves, one per
game and mode, are removed at startup); the play record holds, per game, the
variant played last and, per variant, the best time, the fewest moves and the
solved count. The backup file carries every `pastime.*` entry raw, so a key
added later is in it without a change — except the levels printed ahead, a
cache the device prints again. A restore replaces them all and reloads.

## PWA

Installable, offline after the first visit, a new version swapped in on its
own at a moment of rest (before the first touch, or on the hub), never
mid-game — copy Séance's `vite-plugin-pwa` + workbox setup
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
