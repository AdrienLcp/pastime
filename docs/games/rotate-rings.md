# Rotate Rings

After the "Rotate Rings" game Adrien plays (screenshot from 2026-10-07,
level 24). Later game: confirm the rules below with a screen recording before
any work.

## What the screenshot shows

- Rings of several colours laid out on a lattice. Some are **closed circles**,
  others are **open arcs** (a C shape, the gap facing some direction).
- Rings are joined by short **bars**, each ending in a small square in the
  colour of one of the two rings it joins: the square marks which ring owns
  the bar.
- Some closed rings hold a collectible (an acorn).
- A score counter and two boosters (a rocket, a hammer): monetisation, not
  rules — none of that comes over.

## Rules as understood (to confirm)

Goal: remove every ring. Tapping an open ring rotates it (a step, or until the
next stop). A ring comes off the board once nothing holds it any more: when
its gap has turned past every bar that crossed its arc. A bar owned by another
ring that still sits on the board blocks the rotation, so the order matters —
free the outer rings to unlock the inner ones. Closed rings cannot turn; they
fall once every bar touching them is gone, releasing their acorn.

Open questions for the recording: does a tap rotate by a fixed step or until
blocked? What exactly stops a rotation — any bar, or only bars of other
rings? Does a removed ring take its own bars with it? Can a level be lost
(a move counter, a dead end), or only stalled?

## Generation (once confirmed)

Build backwards from an empty board: add rings one by one, each held only by
bars of rings already placed, so the reverse order is a guaranteed solution.
The solver searches tap orders to grade difficulty (dependency depth, number
of rings that must turn more than once).
