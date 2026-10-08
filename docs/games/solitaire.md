# Solitaire

Klondike, the Windows classic.

## Rules

52 cards: seven tableau columns (1 to 7 cards, the last face up), the stock,
the waste, four foundations from ace to king by suit. Build the tableau down
in alternating colours; only a king fills an empty column. Draw 1 from the
stock, unlimited passes. Draw 3 is out of scope (Adrien never plays it); the
engine keeps the draw count a parameter so it costs nothing to add later.

## Play

- Drag and drop, and tap-to-move: a tap sends the card to its best legal
  destination (foundation first), a second tap cycles destinations.
- Unlimited undo, auto-complete once every card is face up, a hint button.
- Smooth card animations; reduced motion makes them instant.
- Statistics: games won, best time, fewest moves.

## Deals

- **Winnable deals only** (default): before showing a deal, a solver searches
  for a win (depth-first with move ordering and a state cache) within a budget
  of 500 positions; a deal it does not solve in time is replaced by the next
  shuffle. Measured on 50 deals: 29 solved within 500 positions, the slowest
  in 27 ms; 8000 positions solve only three more, twenty times slower. So no
  pool of seeds is pre-computed: the Worker shuffles up to 8 deals per seed,
  over up to 4 seeds, and reports a failure past that. The deals shown lean
  slightly towards those a short search wins.
- A "random deal" option for the purists.
- A deal is reproducible from its seed (shared or replayed).

Cards drawn in SVG to the design system, one face per suit and rank — no
external card image set with an unclear licence.
