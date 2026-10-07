# 05 — Pipes

Goal: Pipes playable from 5×5 to 13×13, unique solutions, the water filling
live.

## Read first

`docs/games/pipes.md`; the Pipes example page from step 02.

## Do

1. `features/pipes/engine`: tiles as edge bitmasks, rotate, lock, connected
   set from the source, win check (all connected, no open end, no loop).
2. `generator` + `solver` (Worker): spanning tree, shuffle, uniqueness by
   constraint propagation with re-meshing of stalled areas.
3. Board in SVG: rotation animation, water fill, locked state, rotate
   direction toggle.

## Tests

- Over 200 seeds per size: one solution, reached by the solver without
  guessing; the tree has no loop and covers every tile.
- Rotating a tile four times restores the state.

## Done when

A 7×7 and a 13×13 are won in a browser at phone width, the water fill reads
clearly in light and dark.
