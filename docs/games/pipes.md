# Pipes

Known as "Net" in Simon Tatham's Puzzles (the "Puzzles" app on Android).

## Rules

A grid of tiles — dead ends, straights, corners, T-junctions — each shown in a
random rotation. The water source is in the centre. Rotate tiles until every
tile is connected to the source, with no open end and no loop.

## Play

- A tap turns a tile a quarter in the chosen direction; the direction toggle
  under the board (Clockwise / Anticlockwise) flips it for one-handed play. A right
  click turns the other way on desktop.
- A long press locks a tile the player is sure of (set on a tinted ground);
  a locked tile refuses to turn, and a second long press frees it. Keyboard:
  arrows move, Enter turns, `L` locks.
- Water fills from the source in real time: a joined tile's channel turns
  `--water`, and a branch that joins fills outward from the join, one step per
  tile. The win is the water reaching the last tile.
- Sizes 5, 7, 9, 11 and 13, odd so the source sits in the middle. No size
  cap on narrow phones: a tile is a tap, not a precise control, and the board
  fits without scrolling (≈ 38 px tiles at 9×9, ≈ 25 px at 13×13 on a 360 px
  screen). "Wrapping" variant later (edges connect around).
- The hint names a tile locked the wrong way first, then the next tile logic
  settles from the locked ones that does not face its way yet.

## Generation

Built in `src/features/pipes/`.

1. A random spanning tree of the grid from the centre (randomised Prim), no
   tile opening four ways — dead ends, straights, corners and T's only.
2. Uniqueness: the solver (`solver/pipes-solver.ts`) works on shapes alone and
   settles tiles by logic — a pipe meets an open side, a wall meets a closed
   one; two tiles already joined cannot be joined again (loop); a network
   cannot close off while tiles remain outside it. When it stalls, the tree is
   reshaped around the stall, as Simon Tatham's Net does: a pipe is laid from
   a stalled tile and one pipe on the loop it closes is taken out
   (`generator/tree-reshape.ts`). Solved by logic means one solution.
3. Every tile is dealt facing some other way than in the solution.

The raw tree already solves by logic most of the time (a third of 9×9 trees
stall; a handful of reshapes fix them), so generation takes milliseconds.
The tests check 200 seeds per size, and count solutions by plain backtracking
up to 9×9.
