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
- Statistics: games won, best time, fewest moves, best score.

## Score

Windows' standard scoring, shown in the band beside the clock:

| Move | Points |
| --- | --- |
| Waste to tableau | +5 |
| Waste or tableau to foundation | +10 |
| A tableau card turned over | +5 |
| Foundation back to tableau | −15 |
| Tableau to tableau, a draw | 0 |
| Recycling the stock, drawing 1 | −100 for every pass after the first |
| Recycling the stock, drawing 3 | −20 for every pass after the third |

- The score never drops below 0: each move's points are added, then the
  total is held at 0 at least.
- It is read off the moves played (`solitaire-score.ts`), so an undo takes
  its points back exactly and a resumed game scores the same.
- A recycle once every tableau card is face up costs nothing: the game is
  decided, and « Tout ranger » may need one. Its moves to the foundations
  score +10 each, like any other.
- On a win, a time bonus of `700 000 / seconds` (whole seconds, rounded
  down) is added, as Windows does — but only for a game of 30 s or more;
  a faster one gets no bonus, which keeps an instant win from scoring
  absurdly high. Windows' timed mode, −2 every 10 seconds, is left out.
- The win sheet prints the total, the time bonus within it, and the best
  score of the deal kind, kept in the play record.

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
- A deal is reproducible from its seed, so a replay deals it again.

Cards drawn in SVG to the design system, one face per suit and rank — no
external card image set with an unclear licence.
