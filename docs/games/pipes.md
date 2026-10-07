# Pipes

Known as "Net" in Simon Tatham's Puzzles (the "Puzzles" app on Android).

## Rules

A grid of tiles — dead ends, straights, corners, T-junctions — each shown in a
random rotation. The water source is in the centre. Rotate tiles until every
tile is connected to the source, with no open end and no loop.

## Play

- Tap rotates clockwise, a second gesture (long-press or two-finger tap, plus
  a toggle for one-handed play) anticlockwise.
- Lock a tile you are sure of (it stops rotating, shown as locked).
- Water fills from the source in real time: connected tiles show as filled,
  so progress is visible at every move. Win animation: the water reaches the
  last tile.
- Sizes 5×5 to 13×13; "wrapping" variant later (edges connect around).

## Generation

1. A random spanning tree of the grid from the centre (randomised Prim, with a
   bias that controls the share of straights versus junctions).
2. Each tile's shape is read from its edges in the tree; rotations shuffled.
3. Uniqueness: Tatham ensures a unique solution by detecting ambiguous
   sections and re-meshing them; do the same — the solver propagates
   constraints (open edges must face open edges, borders are closed, no loop);
   if it stalls, change the tree around the stalled area and retry.

Rendering in SVG: the pipe shapes are a handful of paths rotated per tile;
water fill is a stroke colour transition (respecting reduced motion).
