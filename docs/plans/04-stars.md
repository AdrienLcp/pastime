# 04 — Stars

Goal: Stars playable at every size and difficulty, every level unique by
logic, daily puzzle included.

## Read first

`docs/games/stars.md`; the Stars example page from step 02.

## Do

1. `features/stars/engine`: state, moves (cycle, cross, star, drag-cross),
   conflicts, win check.
2. `solver`: logical techniques in order of difficulty, returns the steps (the
   hint reuses them) and the hardest technique used.
3. `generator` (Worker): as in the game doc; measure generation time per size
   on a throttled mobile profile and note it in the game doc.
4. Board: cells, region borders, conflicts, auto-cross option, hint with its
   reason in words.
5. Register Stars in `game-frame/game-registry.ts` and remove the Lights
   placeholder (`features/lights/`, its `games.lights` keys, its
   `--chapter-lights` token and contrast pair).

## Tests

- Every generated puzzle over 200 seeds per size: the solver finds exactly one
  solution, without guessing.
- A same seed gives the same puzzle.
- Each technique has a hand-made grid where it is the only way forward.

## Done when

A 5×5, an 8×8 and a 10×10 2★ are played to the win in a browser at phone
width; the daily Stars puzzle is the same in two browsers.
