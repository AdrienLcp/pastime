# 06 — Solitaire

Goal: Klondike that plays as smoothly as the best ad-funded apps, winnable
deals by default.

## Read first

`docs/games/solitaire.md`; the Solitaire example page from step 02.

## Do

1. `features/solitaire/engine`: deck from seed, deal, legal moves, draw 1,
   undo, auto-complete detection, win. Kept generic enough for FreeCell and
   Spider later (cards and piles apart from Klondike's rules).
2. `solver` (Worker): winnable check with a node budget; measure on a
   throttled mobile profile, and fall back to a build-time pool of winnable
   seeds if it is too slow — decision noted in the game doc.
3. Cards in SVG, drag and drop with pointer events, tap-to-move, animations.
4. Stats.

## Tests

- A won game's move list replays to a win from its seed.
- Every move the engine offers is legal; illegal drops are refused.
- 100 "winnable" seeds: the solver's solution replays to a win.

## Done when

Two games are won in a browser at phone width, with drag
and tap; auto-complete plays out; undo goes back to the deal.
