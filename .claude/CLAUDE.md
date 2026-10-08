# Pastime

A collection of small solo puzzle and card games: an installable PWA that
works offline, with no server, every level generated on the device. Built
first for Adrien, who plays these games in ad-ridden apps. Personal project
(`github.com/AdrienLcp/pastime`).

## Conventions

This repo has no `.claude/rules/`: the conventions are `C:/git/toolkit`
(load the `adrien-stack` skill before writing code). Shared code comes from the
`@adrienlcp/*` packages (`C:/git/packages`) before anything is written by hand.
Séance (`C:/git/sport`) is the working reference for the PWA setup. English in
everything committed; the UI dictionaries are French (reference) and English.

`vite build` warns that `inlineDynamicImports` is deprecated: vite-plugin-pwa
2.0.0, the latest, still passes it to Rolldown when it bundles the service
worker — upstream issue vite-pwa/vite-plugin-pwa#912. Upgrade once a release
fixes it; `node_modules` is not patched.

## Where things are

- `docs/plans/README.md` — the build plan index. Read it first, then open only
  the step being worked on.
- `docs/games/<game>.md` — one file per game: rules, generation, what makes a
  good level. Read the one of the game being touched, never all of them.
- `docs/architecture.md` — the shape every game follows, and why there is no
  server.
- `docs/ideas.md` — games that may come later. Not a backlog: adding one is
  Adrien's call.

## Rules that matter most

1. **Zero running cost, no server.** Static files on Cloudflare Pages; every
   save, statistic and setting lives on the device.
2. **Every level is solvable.** A generated puzzle is checked by the game's
   solver before it is shown; a dealt solitaire game is winnable. A level that
   needs a guess is a bug.
3. **Sound is off by default.** When testing in a browser, the app's volume is
   0 and set before the page loads (global rule).
4. **One engine per game, pure and tested**, apart from its screen; adding a
   game never touches another game's folder.
