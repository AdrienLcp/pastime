# Color Dots

After the "Color Dots" game Adrien plays on the Play Store. Rules read from
his screenshots and a recording of level 50 (2026-10-07).

## Rules

- The board is a **tree** of nodes joined by lines. A node holds either a
  coloured **ball** or an empty **ring** (a target) of some colour. Each
  colour has as many balls as rings; rings of a colour often form a chain.
- Tapping a ball sends it along the lines (the only path, since it is a tree)
  to the **deepest free ring of its colour**: it enters the nearest chain of
  free rings of its colour (rings of that colour joined directly by a line)
  and rides to that chain's far end. Chains therefore fill from their far end
  back. "Nearest chain first" rather than "farthest ring of the colour": with
  the farthest ring, a colour whose rings sit in two branches could rarely be
  generated, and the original reads as chains.
- A ball passes freely through **empty rings**, of any colour.
- A **ball** on the route, or a **filled ring** (a ball that arrived), blocks
  it. Arrived balls never move again: blocking is permanent.
- Once a ball leaves its node, the node and its branch line disappear.
- **A blocked tap loses the level**: the ball travels until the node before
  the blocker, stops against it, then the level ends. The puzzle is entirely
  about the order of taps.

The original also has lives, a "revive" by video ad, and boosters (undo,
eraser, phantom): monetisation, none of it comes over.

## In Pastime

- Lose on the first mistake — that is what makes it exciting. The fail
  screen offers **undo the last tap** or restart; a level won without any
  undo counts as "perfect" in the stats.
- A tap on a ball that has no free ring of its colour does nothing (the
  engine refuses it). With one ring per ball it never happens, so there is no
  shake to draw.
- Animation: the ball slides segment by segment at constant speed, faster
  than the original (~3 s for a long route is too slow; aim for ≤ 1 s,
  capped per segment), then the ring fills with a lighter shade and a short
  scale pulse. Reduced motion: instant move, fill without pulse.
- Colour is never the only cue: each colour also has a symbol drawn inside
  its balls and rings.

## Difficulty — decided

Adrien finds easy levels boring: **no difficulty selector**. A numbered
progression that reaches real difficulty within the first ten levels, then
keeps a rhythm of two hard levels and one "boss" level (marked as such,
larger board, long dependency chains). The daily puzzle is a boss level.

Difficulty, measured by the solver: the number of balls, and the number of
tempting wrong taps — along the solution, every tap that moves a ball without
being blocked yet leaves a board no order can clear (`countTraps`). Each
level's recipe (`color-dots-progression.ts`) sets its rings, inks, grid and a
minimum of traps, calibrated on measured levels: the generator builds up to
24 boards and ships the first that reaches it, else the hardest. Levels 1–9
ramp from 4 to 11 balls, level 10 is the first boss (14 balls, 7×10 grid),
then two hard levels (11 balls) and a boss, again and again.

## Generation

Build backwards from the solved board: grow a tree of rings on the grid
(straight orthogonal lines, as in the original), paint them in chains of two
to four, all filled. Then "un-play" balls one at a time: a ball goes back on a
new leaf, on a point of a line (it then blocks that line), or on a branch from
a point of a line, wherever tapping it would ride straight back into the ring
just emptied — checked with the engine's own tap. A ring walled in by the
balls already put back sends the build back a step (bounded backtracking);
about half the boss boards still dead-end and are rebuilt. Played forwards,
the reverse order is a guaranteed solution, replayed once more before the
level ships. The solver (depth-first over tap orders, boards already settled
kept, a ball cut off by a filled ring proving a board hopeless at once) grades
the level and gives the hint.

Not done yet: the « perfect » count (a level won without any undo) in the
stats.
