# Example pages brief (step 02, design direction)

Each direction is ONE self-contained HTML file, `.impeccable/directions/<slug>/index.html`
(inline CSS + JS, inline SVG; fonts from Google Fonts are acceptable in these
prototypes only, the app will self-host). Adrien opens it on his phone and
compares directions, so it must feel like the real app, not a mood board.

Read first: `PRODUCT.md`, `docs/games/stars.md`, `docs/games/pipes.md`,
`docs/games/solitaire.md`, `docs/games/color-dots.md` (rules only, skim), and
`C:/Users/AdrienLacourpaille/.claude/skills/impeccable/reference/craft-floor.md`
(the quality floor and bans; obey it).

## What the page holds

A phone-frame app (max-width ~430px centred on desktop, full width on a phone,
no horizontal scroll at 360px). A small, discreet "prototype bar" outside the
app chrome (top, collapsible) lets Adrien switch: screen, light/dark, and state.
Everything below must exist and use real French copy (FR is the reference
language; keep strings short enough that English would fit):

1. **Accueil (hub)** — the games (Étoiles, Tuyaux, Solitaire, Color Dots, and
   a "bientôt" slot is NOT shown: only the four), today's daily puzzles (date
   in French, e.g. « mardi 7 octobre »), a game in progress to resume
   (e.g. Étoiles 8×8, 3 min 12 s), the daily streak. Also an **empty state**
   (first launch: nothing in progress, no streak) switchable from the bar.
2. **Étoiles** — 8×8 board mid-game: 8 regions (distinguished by colour AND by
   a second cue: border weight between regions, and/or pattern/hatching), some
   stars, some crosses, ONE conflict shown (two touching stars, or two in a
   row) marked without relying on colour alone. Frame: timer, undo, hint,
   restart/menu. Hint text example: « Cette région n'a plus qu'une colonne
   possible. »
3. **Tuyaux** — 9×9 Pipes mid-game: a source in the centre, pipe tiles
   (ends, straights, elbows, tees), part of the network connected and filled
   with water, the rest dry; filled vs dry readable without colour alone
   (fill inside the pipe vs hollow outline). Rotate-on-tap affordance.
4. **Solitaire** — Klondike draw 1 mid-game in phone portrait: stock, waste,
   4 foundations (some cards on them), 7 tableau columns with face-down and
   face-up cards. Suits readable by shape and colour; cards fit 7 columns in
   360px. Cards drawn in the direction's own grammar (SVG/CSS), not emoji.
5. **Victoire (win)** — time, best time (« Nouveau record » variant), streak,
   next actions (rejouer, puzzle suivant, accueil). A small moment of delight
   that respects reduced motion.
6. **Icône** — the app icon at 512, 192, 48 and favicon sizes, on light and
   dark home-screen backgrounds, plus a maskable safe-zone preview. Pure SVG.

Also show Color Dots as a game in the hub with its own glyph (no board needed).

## Hard constraints

- WCAG AA contrast in light AND dark (both fully designed; dark is first-class,
  evening play). Colour never alone distinguishes regions, balls, states.
- Touch targets ≥ 44px. Boards fit a 360px-wide viewport without scrolling.
- `prefers-reduced-motion` honoured. Colours as OKLCH custom properties on
  :root, redefined for dark.
- No gradients-as-decoration, no glassmorphism, no generic icon tiles, no
  badges/coins/gems, no neon arcade, no casino. Calm, crisp, satisfying.
- Each game keeps its own character inside one family resemblance.
- The board is the product: frame chrome is quiet and small.
- Make interactions live where cheap: tapping a Stars cell cycles
  empty → cross → star; tapping a pipe tile rotates it (no need to recompute
  water); light/dark and screen switching work. Board data hard-coded.
- Open the HTML with an opening comment holding the direction contract given
  in your prompt.

When finished, check your page renders: run it through Playwright if the tool
is available to you (resize to 360×780 and 430×932, both themes, every screen),
or at minimum validate the HTML has no JS errors by reasoning carefully. Fix
what you see once. Report back: file path, and 3 lines on what you'd improve.
