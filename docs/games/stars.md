# Stars

Also known as Star Battle, Queens (LinkedIn), the stars game on Netflix Games.

## Rules

An N×N grid split into N coloured regions. Place stars so that every row,
every column and every region holds exactly one star, and no two stars touch,
diagonals included.

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

Sizes 7×7, 9×9, 11×11, 13×13 and 15×15; a first game opens on 11×11. Regions in flat colours from a palette that stays distinct for
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
looks furthest from its coloured neighbours; past twelve regions (13×13,
15×15) an ink comes back, never on two bordering regions.
Auto-cross is a play setting (`autoCross`, on by default), switched from the
game's own settings panel, and only draws:
the crosses it adds are derived from the stars, lighter than the player's,
and vanish with the star — they are never moves, so undo never sees them.

**Solver** (`solver/`). Techniques, easiest first, each sound on its own:

| Technique | What it sees |
| --- | --- |
| next-to-star | a cell touching a star holds none |
| full-unit | a unit with its star: the rest holds none |
| single | a unit with one open cell left |
| confinement | one unit's open cells inside one unit of another kind (region in a row, row in a region…) |
| touching | a star on this cell would leave some unit without room — one placement deep, never further |
| pair, triple | the same count over two or three units |

Logic reaching a full grid means the solution is unique; the generator test
checks it against a separate brute-force counter on 200 seeds per size up to
9×9, 30 on the larger ones. The
hint skips the first two techniques (auto-cross draws them) and points first
at a wrong star or a cross over a solution star.

**Generator** (`generator/`). A random solution (row backtracking), regions
flood-filled from its stars — each region drawing an appetite, so small
regions sit beside large ones and give logic a foothold — then reshaped a
cell at a time, keeping each change that lets logic decide at least as much,
until logic solves the grid at the size's minimum difficulty
(`STARS_VARIANTS`). 70 % of reshapes move a cell logic left open; 30 % move a
star of a rival solution (`rival-solution.ts`: another star layout logic has
not ruled out yet) into a bordering region, which kills that rival and may
cost logic up to 20 decided cells. Large grids end nearly solved with a few
rivals left, which random reshapes take long to find. 3000 reshapes per grid,
four grids per seed, then the seed is given up on (a deterministic give-up,
so a retry draws the same derived seed on every device).

Generation time, 40 seeds per size, Chrome with the CPU throttled ×4
(a mid-range phone), 2026-10-08, no failure on any size:

| Size | Median | 90th pct | Worst |
| --- | --- | --- | --- |
| 7×7 | 15 ms | 65 ms | 197 ms |
| 9×9 | 53 ms | 323 ms | 958 ms |
| 11×11 | 338 ms | 1.6 s | 4.4 s |
| 13×13 | 615 ms | 2.2 s | 3.4 s |
| 15×15 | 1.2 s | 4.6 s | 9.4 s |

About one 15×15 grid in twenty overruns the worker's 6 s timeout on such a
phone; the attempt is dropped and a derived seed drawn, which is faster than
waiting on a slow one. The next level is printed ahead while one is played,
so the wait only shows on the first grid of a size.

The appetite is what makes 13×13 and 15×15 reliable. Grown evenly (30 seeds
per size, Node, 2026-10-08), regions look better — 1.1 to 2.7 one-cell
regions per grid and the largest at about a fifth of it, against 2.1 to 3.9
and a third with the appetite — but 13×13 failed 2 seeds of 30, 15×15 failed
4, and both ran four times slower. A one-cell region is a star given away;
grids keep a few of them on every size.

Even sizes were dropped with 5×5 when the range went up in steps of two:
they are no easier to generate (14×14 had the slowest grid of the Node
benchmark), and five sizes fit the variant panel.

**2★ removed (2026-10-08).** The 10×10 two-star variant is gone, and with it
`starsPerUnit`; a saved game or printed level of a size no longer offered is
dropped by the loader instead of resumed.
