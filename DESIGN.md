---
name: Pastime
description: A pocket puzzle book that never runs out — process-ink chapters, printed grids, the player's pencil.
colors:
  paper: "light-dark(oklch(98.5% 0.004 240), oklch(17% 0.008 260))"
  paper-sunk: "light-dark(oklch(94.5% 0.006 240), oklch(22.5% 0.01 260))"
  sheet: "light-dark(oklch(99.8% 0.002 240), oklch(21.5% 0.01 260))"
  desk: "light-dark(oklch(93% 0.006 240), oklch(13% 0.006 260))"
  ink: "light-dark(oklch(20% 0.012 260), oklch(92% 0.014 95))"
  ink-soft: "light-dark(oklch(43% 0.012 260), oklch(76% 0.012 95))"
  rule: "light-dark(oklch(80% 0.008 250), oklch(40% 0.01 260))"
  pencil: "light-dark(oklch(36% 0.008 260), oklch(84% 0.006 260))"
  cyan: "light-dark(oklch(73% 0.135 228), oklch(72% 0.12 228))"
  magenta: "light-dark(oklch(63% 0.225 0), oklch(63% 0.2 0))"
  yellow: "light-dark(oklch(88% 0.165 96), oklch(85% 0.145 95))"
  green: "light-dark(oklch(72% 0.15 150), oklch(70% 0.13 150))"
  cover-ink: "oklch(17% 0.012 260)"
  water: "light-dark(oklch(60% 0.14 232), oklch(74% 0.13 226))"
  card: "light-dark(oklch(99.5% 0.002 240), oklch(93% 0.01 95))"
  card-ink: "oklch(20% 0.012 260)"
  card-red: "light-dark(oklch(53% 0.21 15), oklch(49% 0.2 15))"
  stamp: "light-dark(oklch(53% 0.21 15), oklch(68% 0.19 18))"
typography:
  masthead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(3.375rem, -0.0027rem + 17.6152vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 118"
  number:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 72"
  cover-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: 0.95
    fontVariation: "'wdth' 70"
  section:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 800
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 92"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
  hand:
    fontFamily: "Gochi Hand, Segoe Print, cursive"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  card: "5px"
  stamp: "6px"
spacing:
  4xs: "0.125rem"
  3xs: "0.25rem"
  2xs: "0.375rem"
  xs: "0.5rem"
  s: "0.75rem"
  m: "1rem"
  l: "1.375rem"
  xl: "1.875rem"
  2xl: "2.625rem"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    height: "48px"
    padding: "0 18px"
  button-line:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "50px"
  theme-choice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0 12px"
  theme-choice-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: Pastime

The tokens live in `src/presentation/styles/_tokens.sass`; this file says how
to use them. Every screen is built. The first example page,
`.impeccable/directions/cahier/index.html`, is kept for the record only: it
still shows the daily list, numbered puzzles and patterned Stars regions,
all gone since.

## Overview

**Creative North Star: "Cahier de jeux" — a pocket puzzle book that never runs out.**

Each game is a chapter with its own process-ink cover, and as many levels as
the player wants. Grids are printed in black ink with heavy outer frames; the
player's notes and records are written in pencil. A solved puzzle gets a red
stamp pressed onto the page. It refuses the generic game hub: no gradient tiles, no
badges, no coins, nothing glowing.

Print, but not the cream-paper and italic-serif cliché: the day book is a cool,
bright white page, the inks are flat and at full strength, owning whole regions
(a chapter cover, a game's header band). The night book — evening play is the
common case — is the same booklet under a lamp: ink-black paper, chalky
off-white lines, the inks kept, a shade deeper, still AA.

**Key characteristics:**
- Flat process inks per chapter; everything printed on them is near-black.
- Square print: borders, rules and frames; corners only on cards and the stamp.
- Archivo's width axis does the hierarchy: wide masthead, condensed titles.
- Pencil (graphite strokes + Gochi Hand) is the player's voice, never the app's.
- One authored moment per gesture: a pencil loop drawn in, a stamp pressed.
- A phone is one page; a wide landscape screen opens it into a spread — the
  board on the left page, the chapter's cover on the right.

## Colors

Paper, ink, pencil, and four process inks — one per chapter.

### Primary — the chapter inks

Each game owns one ink, used for its cover on the hub, its header band in
the game frame (the right page of a spread), its wash on a board:

| Game | Token | Ink |
| --- | --- | --- |
| Pipes | `--chapter-pipes` | **Process Cyan** `--cyan` |
| Solitaire | `--chapter-solitaire` | **Process Magenta-Red** `--magenta` |
| Stars | `--chapter-stars` | **Process Yellow** `--yellow` |
| Color Dots | `--chapter-color-dots` | **Process Green** `--green` |

A new game takes a new ink only if it holds `--cover-ink` at ≥ 4.5:1;
otherwise it shares one and tells itself apart by its glyph.

Color Dots needs a fifth ball colour: **Orange** `--orange`, a process-like
ink of no chapter, holding `--cover-ink` like the four. Never `--ink`: at
night it prints near-white, the colour of the board's lines.

### Neutral

- **Paper** (`--paper`): the page. The app's ground, and the `theme-color`
  in `index.html` (`#f8fafd` / `#0d1013`) and the manifest (night).
- **Paper sunk** (`--paper-sunk`): a pressed row or tool, a folded corner.
- **Sheet** (`--sheet`): a loose sheet on the page — an install notice.
- **Desk** (`--desk`): beyond the booklet's width on a wide screen.
- **Ink** (`--ink`): all print — text, grid lines, frames, the inverted button.
  Also the focus ring (`--focus`), drawn through `_focus.sass`; on a chapter
  ink — a cover, a game's band — the region sets `--focus: var(--cover-ink)`.
- **Ink soft** (`--ink-soft`): counts, captions, empty slots.
- **Rule** (`--rule`): thin lines between rows and Pipes cells.
- **Pencil** (`--pencil`): the player's marks and handwriting.
- **Cover ink** (`--cover-ink`): text and glyphs on a chapter ink, both books.

### Game inks

- **Water** (`--water`): a connected pipe's channel.
- **Card**, **card ink**, **card red** (`--card`, `--card-ink`, `--card-red`):
  a playing card's face stays paper-white at night (`--card` turns warm
  off-white), its black stays black.
- **Stamp** (`--stamp`): the « Résolu » stamp.
- **Region inks** (`src/features/stars/presentation/region-inks.ts`): twelve
  flat inks for Stars regions, a light tint by day and a deep shade at night,
  set apart by lightness as much as by hue (see the Stars board below).
- **Tint** (`--tint`): how much chapter ink washes the paper where a board
  marks something as the player's — a locked Pipes tile.

### Named rules

**The Ink-Is-Not-Information Rule.** Colour never tells regions, balls or
states apart alone: a Stars region also has heavy borders, and its inks stay
apart for every colour vision; a conflict is ringed and named in words; a
Color Dots ink has its symbol; a wet pipe is filled, a dry one hollow.

**The Near-Black-On-Ink Rule.** Text on a process ink is `--cover-ink`, in
both books. Never white on yellow, never ink-soft on a cover.

`src/presentation/styles/tokens-contrast.test.ts` holds every pair that meets
on screen; a new colour joins it in the commit that adds it.

## Typography

**Print font:** Archivo (variable: weight 100–900, width 62–125 %), with
`'Archivo fallback'` (Arial scaled to Archivo per weight band) then `system-ui`.
**Hand font:** Gochi Hand, with `'Segoe Print'`, `cursive`.

Both self-hosted from `public/fonts/` (latin, plus latin-ext for Archivo),
SIL OFL 1.1. Only `archivo-latin.woff2` is preloaded.

**Character:** a grotesque that stretches from poster-wide to newsprint-narrow,
and a felt-tip hand for what the player writes.

### Hierarchy

- **Masthead** (900, wdth 118 %, `--text-masthead`, 0.86): « Pastime » on the
  hub's cover band. Once per screen at most. It grows from 3.375rem on a
  307 px screen to 5rem on a 455 px one, through `sizes.fluid()`.
- **Number** (900, wdth 72 %, `--text-number` 34 px, 1, -0.02em): a page's
  own heading — the settings, the pause cover, a page not found.
- **Cover title** (900, wdth 70 %, `--text-cover`, 0.95, uppercase): a
  chapter's cover on the hub and, larger, the game's name heading the right
  page of a spread.
- **Section** (800, wdth 92 %, `--text-section`): a heading in running print,
  followed by a 1.5 px ink rule to the edge.
- **Body** (400, `--text-m`, 1.4, tabular numerals everywhere).
- **Label** (800, `--text-s`): buttons, theme choices, tools (tools at
  `--text-3xs` 700 under their icon).
- **Meta** (600, `--text-2xs`): counts, captions, in `--ink-soft`.
- **Caps** (800, `--text-4xs`, +0.07em, uppercase): the score box's terms
  (Temps, Record), the clock's label, the choice's heading.
- **Hand** (Gochi Hand 400, `--text-hand` 20 px, `--text-hand-large` 30 px):
  a pencil note under the board, the win screen's figures, « nouveau
  record ! ». Always `--pencil`.

**The Hand-Is-The-Player's Rule.** Gochi Hand only writes what the player
did — a time, a record, a note about their own marks. Interface copy is never
handwritten.

## Layout

The booklet's page is a phone: one column, at most `--sheet-width` (430 px),
centred on `--desk` with a 1 px `--rule` edge beyond it. Side margin
`--gutter` (1rem) at every width; safe-area insets padded by the shell.
Boards go nearly edge to edge (4 px padding) so a 360 px phone gets the
largest cells possible.

Past 40rem (`layout.open-page`) the page opens to 44rem and the hub lays its
covers two by two. On a landscape screen of 60rem and more (`layout.spread`)
it becomes a **spread** up to 92rem wide — « la planche ». A game's left page
is the board, centred in the room left and sized to it; the right page,
`clamp(19rem, 25vw, 24rem)` wide, is the chapter's cover printed on its ink:
the back link, the game's name in a large cover title, its rule, the clock,
then the tools — or, once solved, the score. Everything printed on that page
takes `--cover-ink`, its rules and pressed states mixed from it. The variant
choice takes the tools' place on that page, a picked size's empty grid on the
left.

A phone held sideways — landscape, under 30rem tall and 40rem wide or more
(`layout.short-spread`) — is a spread too: the column would push the board
and its tools below the fold. Its cover page narrows to 16rem and everything
fits the screen's height without a scroll: no 32rem floor, tight margins
around the board, the title and the clock set at 2rem, the clock and the
score on one line, and the tools three over two, each label under its icon
as on the phone's bar. Once solved, the band takes one line, the game's name
beside the back link, and the page widens to 24rem with each
figure and its note sharing a line. A panel that still cannot fit scrolls
inside its page, never under the band. The hub lays its covers side by side,
as tall as the masthead leaves them. Solitaire's cards are sized on the
table's height as much as its width, so they grow with the left page.

Spacing steps from `--space-4xs` (0.125rem, 2 px) to `--space-2xl` (2.625rem,
42 px), in rem so they grow with the reader's font size; px figures in this file
are at the default 16 px. Section
heads sit `--space-xl` below what precedes them and `--space-s` above what
follows. The hub ends on the app's notices (install, update): a notice
arrives after the first paint, so it is printed below the contents and pushes
nothing in view. Game screens carry no notice.

A game screen on a phone is a column: header band, board, note line (30 px tall even
empty, so the board never jumps), status line, then the tool bar pinned to
the bottom (`margin-top: auto`).

## Elevation & Depth

Flat print. Depth is drawn with lines and the paper's own shades, with one
exception: a Solitaire card the player lifts casts `--shadow-held`,
`drop-shadow(0 6px 8px var(--shadow-ink))`. Nothing else lifts.

## Shapes

Square by default: every box is drawn with `--print-line` (1.5 px ink) or a
heavier frame. Rounded corners exist only where the object is round in life:
playing cards (`--radius-card`, 5 px) and the stamp (`--radius-stamp`, 6 px).

Line weights (CSS): hairline 1 px (`--stroke-hair`, rows, separators),
print 1.5 px (`--stroke-thin`, boxes), bold 2 px (`--stroke-bold`, the tool
bar's top), frame 2.5 px (`--stroke-frame`, the score box), heavy 5 px
(`--stroke-heavy`, the masthead's rule). The masthead rule is double:
5 px over 1.5 px, 4 px apart.

## Components

### Masthead

The hub's cover band: a row of five 12×8 px ink swatches (the four chapters,
then ink) with the settings link at the far end, « Pastime » in the masthead
style, then the double rule. Nothing else: no date, no count.
`src/features/hub/masthead.tsx`.

### Theme switch

Three printed tabs in one 1.5 px ink box — Auto / Clair / Sombre — the
selected one inverted (ink ground, paper text), the pressed one
`--paper-sunk`. 44 px tall. A react-aria `RadioGroup` on
`@adrienlcp/theme-preference`: the choice is stored (`pastime.theme`), stamped
on `<html data-theme>` before the first paint, and the `theme-color` metas
follow it. `src/presentation/theme/`.

### Buttons

- **Ink** (primary): `--ink` ground, `--paper` text, label type, 48 px tall
  (54 px for the win screen's main action), square, an 18 px icon after the
  label.
- **Line** (secondary): 1.5 px ink border, ink text, 50 px tall.
- **Text** (notices): the label underlined 2 px.
- Pressed: a line button, a row or a tool takes the `--paper-sunk` ground;
  the ink button lightens to `--ink-soft` under its `--paper` label; a cover
  or a band's button darkens with 10–12 % of `--cover-ink` mixed into its
  chapter ink; a board cell darkens with 14 % of `--ink`.

### Game header band

On a phone, a row in the game's chapter ink, text `--cover-ink`: a 48 px back
link to the list of games, the game's name, then the timer (800, wdth 90 %,
`--text-timer`) and a 48 px pause button. No number, no variant, no count —
but a game that keeps points (Solitaire) prints them before the clock, the
figure in the timer face with a small « pts », a thin rule between the two. On
a spread it heads the right page: « Jeux » after the back arrow, the name in
a large cover title, the rule beneath, and the clock large under a caps
« Temps », then the points as large under a caps « Points ».

### Tool bar

Four equal columns, 60 px tall, 2 px ink rule on top, 1 px `--rule`
between them; a 22 px stroke icon over a micro label (Annuler, Indice,
Nouvelle partie — « Nouvelle donne » in Solitaire — then the
variant's word: Taille, Donne, Difficulté), a long word hyphenated. A toggled
tool is `--paper-sunk`. « Nouvelle partie » on a level with moves asks once,
in place: its label turns to « Abandonner ? » on `--paper-sunk` for 4 s, and
a second press opens the next level; untouched, it opens it at once. Icons: 24-unit viewBox,
2-unit round strokes, drawn in the reference page's `<symbol>`s.

### The chapter covers

The hub is the list of games and nothing else: under the masthead, each
chapter as a full-width cover block — its ink, an uppercase condensed title,
its rule in a sentence, a meta line once a level is solved (the solved count
and the best time), its glyph printed large and cropped off the right edge.
Past 40rem they lie two by two, each a page of its own. A cover opens the
game straight on a level: the game left mid-way, else a new one of the
variant played last — on a first game, one in the middle of the range
(11×11, 9×9, Difficile, Gagnable). Glyphs use a 48-unit viewBox.
`src/features/hub/chapter-covers.tsx`.

### The variant choice

The tool bar's last tool, named by what the variants differ by (« Taille »,
« Donne », « Difficulté »), puts the choice in the tools' place — under the
board on a phone, on the right page of a spread — while the board stays:

- A caps heading ruled out to the edge, then the variants as printed tabs in
  one 1.5 px ink box, the selected one inverted, like the theme switch. A
  variant with a note (Solitaire's deals) takes a full row, its note under
  its label. The variant on the board is picked when it opens.
- Picking another size shows its empty grid in the board's place, `--rule`
  lines in a 5-unit ink frame, so a size is seen before it is played; picking
  the board's own variant brings the board back.
- Then « Nouvelle partie » in ink, which asks « Abandonner ? » once when moves
  were played, as the tool does, and a line « Fermer » at its own width.
  Escape closes it too. On a spread the two stack full width.

The variant started this way is the one the game opens on next time.
`src/features/game-frame/presentation/variant-panel.tsx`.

### The board grammar

Every board is an inline SVG drawn to the full column width, ink on paper,
with a **5-unit outer frame**. A pencil mark — the loop round a new record, a
Pipes lock, a Color Dots blocker — is a stroked path (`--pencil`, round
caps and joins, `pathLength="1"`) drawn in on creation:
`stroke-dasharray: 1; stroke-dashoffset: 1` animated to 0 over
`--transition-base` (260 ms) with `--ease-out`, static under reduced motion.
A loop is one fixed path that overshoots where it closes, as a pencil does
(`pencil-loop.tsx`), so it looks the same on every render.

- **Stars** (`--chapter-stars`): 44-unit cells. Each region is printed flat in
  one of the twelve region inks — no pattern, no hatch — given out so that
  bordering regions never share an ink and stay far apart for every colour
  vision (`region-colouring.ts`). Lines: 0.9 units at 55 % within a region,
  3.4 units square-capped between regions. Stars and crosses are clean
  geometric icons in ink, not handwriting: a solid five-point star, a cross of
  two round-capped 3-unit strokes; auto-cross draws its crosses at 40 %, so
  the player's own still stand out. A tap crosses a cell, a double tap stars
  it. A conflict is ringed in ink (a capsule round both stars when they
  touch, a ring round each otherwise) and named in a hand note under the
  board (« deux étoiles se touchent »). The hint draws a dashed pencil box
  around the cells it is about, and says it in words below. The cells are
  transparent buttons laid exactly over the print — the SVG only draws — so
  the board is played by pointer, keyboard (arrows, Enter) and screen reader
  alike. Built: `src/features/stars/presentation/`.
- **Pipes** (`--chapter-pipes`): 40-unit tiles, cell lines 1 unit in
  `--rule`. A pipe is a 13-unit ink stroke with a 6-unit channel inside it:
  `--paper` when dry, `--water` when connected (a 200 ms colour change,
  `--transition-water`). A dead
  end ends in a bulb; the source is a square ink block with a water core. A tap
  turns the tile a quarter in `--transition-fast` (170 ms); a joining branch
  fills outward from the join, 28 ms per tile
  (`--flow-step`). A locked tile is washed with the chapter ink (`--tint`)
  and boxed in pencil, drawn in. Built:
  `src/features/pipes/presentation/`.
- **Solitaire** (`--chapter-solitaire`): seven columns sized from the
  container (`(100cqw - 24px) / 7`), cards 5:7, `--radius-card`, 1.25 px
  `--card-ink` border on `--card`. Rank top-left (800, wdth 78 %), a suit pip
  top-right, a large suit low centre; hearts and diamonds in `--card-red`.
  The back is a halftone of the chapter ink inside a card-coloured frame.
  Empty slots: dashed 1.5 px `--ink-soft` with the suit's outline.
- **Color Dots** (`--chapter-color-dots`): 40-unit grid steps, lines 3.5
  units in ink, a joint where three lines meet a 7-unit ink block. The one
  board that prints in several inks, since colour is the game: the four
  process inks and ink itself, each with its symbol — cyan a dot, magenta a
  triangle, yellow a square, green a cross, ink a diamond. A ball is a
  13-unit disc of its ink outlined in 1.5 units of ink, its symbol in
  `--cover-ink` (`--paper` on the ink ball). A ring is a 5.5-unit band of its
  ink between two 1.25-unit ink lines, its symbol waiting in the hole in
  `--ink-soft`; filled, a smaller ball sits in it with a rim of paper around.
  A tapped ball rides its route at a steady speed (40 % of
  `--transition-fast` per grid step, 900 ms at most), the ring then seats it
  with a short press; the lines it leaves fade. A blocked ball stops one node
  short, bumps the blocker, and the blocker is circled in pencil; the note
  line then says « Bloquée » and the hint is off until an undo. The hint is
  a dashed pencil circle around the ball to send. Small levels print at
  1.45 px per unit at most. Built: `src/features/color-dots/presentation/`.

### The stamp and the score

« Résolu » in condensed 900 caps (`--text-stamp`, +0.04em), in `--stamp`: a
4 px border, a 1.5 px outline 3 px outside it, `--radius-stamp`, turned -9°,
over the solved board's corner and above every layer of it, cards included.
It presses once: scale 1.5 → 0.96 → 1 over `--transition-slow` (520 ms) with
`--ease-out`, then the ink spreads a hair; static under reduced motion. No
number, no date. Under the board — on the right page of a spread — a score
box (2.5 px frame, two columns: Temps, Record; Solitaire adds its moves, and
a second row, Points — the time bonus within them in small pencil — and
Record)
whose figures are written in pencil; a new record strikes the old one through
and loops the new one, the loop behind and around the figure, never across
it. Then « Nouvelle partie », which opens the next level at once, over
« Rejouer » and « Accueil ».

### App icon

Process yellow, a 3×3 printed grid with a heavy frame, a magenta top-left
cell, a cyan bottom-right cell, and a solid star in the centre.
`scripts/icons/icon.svg` (192/512/apple-touch), `scripts/icons/maskable.svg`
(the same mark inside the 80 % safe zone), and `public/favicon.svg`, a
simpler cut for 16–32 px (one cross line, one cell). `pnpm icons` renders
the PNGs. SVG files carry hex: librsvg does not read `oklch()`.

## Do's and Don'ts

### Do:
- **Do** give every game screen its chapter ink, and only that one.
- **Do** keep 44 px targets on everything outside a board; a board cell is
  as large as the 360 px column allows.
- **Do** write durations with their fallback, `var(--transition-base, 0s)`:
  `reduced-motion.css` collapses them to 0 and ends every keyframe animation
  at once, so no stylesheet writes its own reduced-motion rule. The two
  durations it does not know, `--transition-water` and `--flow-step`, collapse
  beside their definition in `_tokens.sass`.
- **Do** read `--tint` for a wash's strength: it is redefined for the
  night book.

### Don't:
- **Don't** put white or `--ink-soft` text on a chapter ink.
- **Don't** use Gochi Hand for interface copy.
- **Don't** round a box that is not a card or the stamp.
- **Don't** add a shadow other than a lifted card's.
- **Don't** tell anything apart by ink alone.

## Open issues

None.

