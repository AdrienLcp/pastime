# Color Dots

After the "Color Dots" game Adrien plays on the Play Store. Rules read from
his screenshots and a recording of level 50 (2026-10-07).

## Rules

- The board is a **tree** of nodes joined by lines. A node holds either a
  coloured **ball** or an empty **ring** (a target) of some colour. Each
  colour has as many balls as rings; rings of a colour often form a chain.
- Tapping a ball sends it along the lines (the only path, since it is a tree)
  to the **deepest free ring of its colour**: the far end of the chain from
  where the route enters. Chains therefore fill from their far end back.
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
- A tap on a ball that has no free ring of its colour reachable does nothing
  but a short shake, without losing (not observed in the original; it would
  only punish a mis-tap).
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

Difficulty, measured by the solver: number of balls, length of the longest
"must go before" chain, and the number of tempting wrong taps (balls that can
move now but would block a later one).

## Generation

Build backwards from the solved board: start from a tree whose rings are all
filled, then "un-play" balls one at a time — take a filled ring at the end of
its chain, put its ball back on a node reachable from it so that the route
crosses rings already emptied, and re-add the node and branch. The reverse
order is a guaranteed solution. The solver (search over tap orders with
memoisation on the set of moved balls) then confirms solvability and grades
the level; layouts are drawn on a grid with straight orthogonal lines, as in
the original.
