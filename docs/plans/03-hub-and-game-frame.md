# 03 — Hub and game frame

Goal: everything a game shares, proven with a trivial placeholder game, so
each game step only writes the game.

## Read first

`docs/architecture.md`; `toolkit/conventions/routing.md`, `i18n.md`,
`react-components.md`, `sass.md`, `testing.md`; `DESIGN.md`. Load
`impeccable` before the markup.

## Do

1. Router (data mode): `/:locale/`, `/:locale/:game`,
   `/:locale/:game/daily`, `/:locale/settings`. Dictionaries fr + en.
2. Game registry and its type: the contract a game implements (create from
   seed + options, apply move, undo, is won, hint, serialise).
3. `seeded-random` helper and the daily seed (local date → seed, same for
   everyone on that day).
4. Game frame: header (game, size, timer), undo, restart, hint, pause (timer
   stops when the tab is hidden), win screen with best time and streak.
5. Storage: game in progress saved on every move and resumed on return;
   stats per game, size and difficulty; settings (sound off by default,
   haptics off by default, theme, language); export/import of all data.
6. Hub: games, daily puzzles of the day with done/not done, "resume".
7. Worker plumbing for generators (with timeout and retry), tested with the
   placeholder game.

## Done when

The placeholder game can be played, left mid-game, resumed after closing the
tab, won, and its stats appear in the hub — checked in a browser at phone
width, offline.
