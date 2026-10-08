# Stars

Also known as Star Battle, Queens (LinkedIn), the stars game on Netflix Games.

## Rules

An N×N grid split into N coloured regions. Place stars so that every row,
every column and every region holds exactly one star (two in the "2★" variant
on larger grids), and no two stars touch, diagonals included.

## Play

- A tap toggles a cross, a double tap toggles a star; a long press stars
  too. Drag across cells to cross many at once.
- Option (on by default): auto-cross the cells a star rules out.
- Conflicts shown at once (two stars in a row, touching stars), never by
  colour alone.
- Hint: highlights the next cell a logical step decides, and names the
  reason in words ("this region has only one column left").

## Generation

1. Place a valid star solution at random (backtracking on rows).
2. Grow N regions from the stars (random flood fill), so each region holds
   one star.
3. Run the solver: if the puzzle is not unique by logic alone, reshape regions
   locally and retry.
4. Difficulty = the hardest technique the solver needed: next-to-star,
   full unit, single, a unit confined to another (region in a row…),
   touching exclusions, then pair and triple confinements (N regions in N
   rows).

Sizes 5×5 to 10×10 (1★), 10×10 to 12×12 (2★) — 10×10 2★ only for now, see
below. Regions in flat colours from a palette that stays distinct for
colour-blind players, plus a thick border between regions so colour is never
the only cue.

## As built (step 04)

**Play.** A tap crosses a cell, or rubs out its cross or star; a double tap
(second tap within 300 ms) stars it, or rubs its star out; a long press
(420 ms) stars too; a drag crosses every cell it runs over, or rubs crosses
out when it starts on one. Keyboard: arrows move, Enter cycles blank → cross
→ star. The first tap shows its cross at once but is only played when the
window closes or another cell is tapped: a double tap plays one star move,
never a cross first, so undo takes it back in one step
(`presentation/cell-taps.ts`).

**Look.** Stars and crosses are flat geometric icons in the ink colour; a
broken rule is ringed. Each region is one of twelve flat inks
(`presentation/region-inks.ts`), a light tint by day and a deep shade at
night, chosen so every pair stays at least 0.06 apart in OKLab for typical
vision and for protanopia, deuteranopia and tritanopia (Machado 2009), and
marks keep 3:1 contrast on all of them. Regions are coloured as a graph
(`presentation/region-colouring.ts`): bordering regions never share an ink,
and with no more regions than inks every region gets its own, the one that
looks furthest from its coloured neighbours.
Auto-cross is a play setting (`autoCross`, on by default) and only draws:
the crosses it adds are derived from the stars, lighter than the player's,
and vanish with the star — they are never moves, so undo never sees them.

**Solver** (`solver/`). Techniques, easiest first, each sound on its own:

| Technique | What it sees |
| --- | --- |
| next-to-star | a cell touching a star holds none |
| full-unit | a unit with all its stars: the rest holds none |
| single | a unit with exactly as many open cells as stars it lacks |
| confinement | one unit's open cells inside one unit of another kind (region in a row, row in a region…), lacking as many stars |
| touching | a star on this cell would leave some unit without room — one placement deep, never further |
| pair, triple | the same count over two or three units |

Logic reaching a full grid means the solution is unique; the generator test
checks it against a separate brute-force counter on 200 seeds per size. The
hint skips the first two techniques (auto-cross draws them) and points first
at a wrong star or a cross over a solution star.

**Generator** (`generator/`). A random solution (row backtracking), regions
flood-filled from its stars (paired two by two on 2★ grids), then reshaped a
cell at a time — 70 % of the time a cell logic left open — keeping each change
that lets logic decide at least as much, until logic solves the grid at the
size's minimum difficulty (`STARS_VARIANTS`). 600 reshapes per grid, four
grids per seed, then the seed is given up on (a deterministic give-up, so a
retry draws the same derived seed on every device).

Generation time, 20 seeds per size, Chrome with the CPU throttled ×4
(a mid-range phone), 2026-10-07:

| Size | Median | 90th pct | Worst |
| --- | --- | --- | --- |
| 5×5 | 4 ms | 33 ms | 89 ms |
| 6×6 | 8 ms | 45 ms | 77 ms |
| 7×7 | 37 ms | 112 ms | 190 ms |
| 8×8 (daily) | 76 ms | 311 ms | 487 ms |
| 9×9 | 171 ms | 796 ms | 971 ms |
| 10×10 | 332 ms | 1.3 s | 1.5 s |
| 10×10 2★ | 340 ms | 1.9 s | 2.0 s |

The worker's 6 s timeout sits well above the worst case: a slow phone that
timed out would move to the next derived seed and print a different daily
than everyone else, so that margin is what keeps the daily shared.

**Not yet: 11×11 and 12×12 2★.** With these techniques the reshaping never
reached a logic-only 12×12 2★ grid within budget. Those sizes need the 2★
techniques real puzzle books use (2×2 blocks counting at most one star each,
over pairs of rows) before they can be printed.
