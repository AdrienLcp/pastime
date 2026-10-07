# Color Dots

After the "Color Dots" game Adrien plays on the Play Store.

## Rules — understanding to confirm

**Needs Adrien before this step starts:** two or three screenshots (or a
short screen recording) of the original, to confirm what follows.

As understood on 2026-10-07: coloured balls sit on a board of drawn tracks.
Each ball has a target zone of its colour. Tapping a ball sends it along its
track to its target; it fails (or stops) if another ball is on the way. The
puzzle is the order: free each ball's path by moving the right balls first.

Open questions for the screenshots: are tracks fixed or chosen by the player?
Does a blocked ball refuse to move, bounce back, or cost a life? Can a ball in
its zone still block others? Is there a move limit or a timer?

## Generation (once the rules are confirmed)

Generate backwards from the solved state: start with every ball in its
target, then "un-move" balls one at a time onto their tracks so that each
un-move blocks a path already used. The reverse of that sequence is a
guaranteed solution; the solver checks the difficulty (number of balls
whose order matters, longest dependency chain).

Rendering in SVG: tracks as paths, balls following them with
`getPointAtLength`, blocked moves shown with a short bump.
