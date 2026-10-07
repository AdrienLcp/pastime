# 07 — Color Dots

Goal: Color Dots with generated levels that are always solvable.

## Needs Adrien first

Screenshots or a screen recording of the Play Store "Color Dots" game, to
answer the open questions in `docs/games/color-dots.md`. Update that doc with
the confirmed rules before writing code.

## Do

1. `features/color-dots/engine`: board, tracks, balls, targets, tap → move or
   blocked, win.
2. `generator` (reverse play) + `solver` (search over tap orders) for
   difficulty; levels in a numbered progression (seeded) plus a daily one.
3. Board in SVG: balls moving along their track, blocked bump, arrival.

## Tests

- Every generated level over 200 seeds: the generator's solution wins, and
  the solver agrees on solvability.

## Done when

Ten levels in a row are won in a browser at phone width, difficulty rising.
