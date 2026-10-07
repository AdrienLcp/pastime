# 07 — Color Dots

Goal: Color Dots with generated levels that are always solvable.

## Do

1. `features/color-dots/engine`: board, tracks, balls, targets, tap → move or
   blocked (level lost), undo after a loss, win.
2. `generator` (reverse play) + `solver` (search over tap orders) for
   difficulty; the numbered progression and rhythm decided in the game doc, plus
   a daily boss level.
3. Board in SVG: balls moving along their track, blocked bump, arrival.

## Tests

- Every generated level over 200 seeds: the generator's solution wins, and
  the solver agrees on solvability.

## Done when

Ten levels in a row are won in a browser at phone width, difficulty rising.
