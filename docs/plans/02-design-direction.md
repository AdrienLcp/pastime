# 02 — Design direction

Goal: a visual direction Adrien picked by comparing complete example pages,
written down as `PRODUCT.md`, `DESIGN.md` and tokens.

**Start with the `impeccable` skill**, before any markup or style. Every
direction it proposes becomes a **complete example page** — openable HTML,
real content, empty and won states included — that Adrien opens and
compares on his phone. A board of cards or a prose summary does not let him
choose.

## The brief to give impeccable

> Récré is a collection of small solo puzzle and card games — Stars (one star
> per row, column and region, none touching), Pipes (rotate tiles so water
> from the centre reaches every tile), Klondike solitaire, Color Dots (send
> each coloured ball along its track to its zone, in the right order) — and
> more later. It replaces ad-ridden phone apps: no ads, no account, offline,
> installed on the home screen. Its player plays in short sessions, one-handed,
> on a phone, often in the evening.
>
> It must feel like a well-made object, calm and satisfying: crisp boards,
> tactile feedback, a small moment of delight on a win — not a casino, not a
> neon arcade, not a generic "game hub" with gradients and badges. Each game
> keeps its own character inside one family resemblance. Dark mode is a
> first-class citizen (evening play). French is the reference language,
> English must fit.
>
> Screens to show for each direction, as complete pages:
> 1. the hub: the games, today's daily puzzles, a game in progress to resume;
> 2. a Stars board 8×8 mid-game (stars, crosses, one conflict shown);
> 3. a Pipes board 9×9 mid-game, part of the network filled with water;
> 4. Solitaire mid-game, phone portrait;
> 5. a win screen (time, best time, streak);
> 6. the app icon.
>
> Hard constraints: WCAG AA in light and dark; never colour alone to tell
> regions, balls or states apart (shapes, borders, patterns too); touch targets
> ≥ 44 px; boards fit a 360 px-wide phone without scrolling; animations
> respect reduced motion; fonts self-hosted (`@adrienlcp/styles`).

## Done when

- Adrien has picked a direction from the example pages (or mixed two).
- `DESIGN.md`, OKLCH tokens, type scale, the theme switch
  (`@adrienlcp/theme-preference`) and the real app icons are in the app,
  checked in a browser in light and dark at phone width.
- The example pages are kept under `.impeccable/` as the reference for every
  game step.
