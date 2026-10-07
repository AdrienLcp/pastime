# Stars

Also known as Star Battle, Queens (LinkedIn), the stars game on Netflix Games.

## Rules

An N×N grid split into N coloured regions. Place stars so that every row,
every column and every region holds exactly one star (two in the "2★" variant
on larger grids), and no two stars touch, diagonals included.

## Play

- Tap cycles empty → cross → star; long-press or a mode switch for direct
  star. Drag across cells to cross many at once.
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
4. Difficulty = the hardest technique the solver needed: singles, region
   confined to a row/column, touching exclusions, then pair and
   triple confinements (N regions in N rows).

Sizes 5×5 to 10×10 (1★), 10×10 to 12×12 (2★). Region colours from a
palette that stays distinct for colour-blind players, plus a thick border
between regions so colour is never the only cue.
