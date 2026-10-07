---
name: Pastime
description: A pocket puzzle book that never runs out — process-ink chapters, printed grids, pencil marks.
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
to use them. The reference for every screen not built yet is the chosen
example page, `.impeccable/directions/cahier/index.html` (hub, Stars, Pipes,
Solitaire, win, icon — open it with `#stars`, `#pipes`, `#cards`, `#win`,
`#icon`).

## Overview

**Creative North Star: "Cahier de jeux" — a pocket puzzle book that never runs out.**

Each game is a chapter with its own process-ink cover; each puzzle is numbered
(« N° 214 »). Grids are printed in black ink with heavy outer frames; the
player writes in pencil, slightly rough. A solved puzzle gets a red stamp
pressed onto the page. It refuses the generic game hub: no gradient tiles, no
badges, no coins, nothing glowing.

Print, but not the cream-paper and italic-serif cliché: the day book is a cool,
bright white page, the inks are flat and at full strength, owning whole regions
(a chapter cover, a game's header band). The night book — evening play is the
common case — is the same booklet under a lamp: ink-black paper, chalky
off-white lines, the inks kept, a shade deeper, still AA.

**Key characteristics:**
- Flat process inks per chapter; everything printed on them is near-black.
- Square print: borders, rules and frames; corners only on cards and the stamp.
- Archivo's width axis does the hierarchy: wide masthead, condensed numbers.
- Pencil (graphite strokes + Gochi Hand) is the player's voice, never the app's.
- One authored moment per gesture: a pencil stroke drawn in, a stamp pressed.

## Colors

Paper, ink, pencil, and four process inks — one per chapter.

### Primary — the chapter inks

Each game owns one ink, used for its cover on the hub, its header band in
the game frame, its tint steps on the board, its tab in today's list:

| Game | Token | Ink |
| --- | --- | --- |
| Pipes | `--chapter-pipes` | **Process Cyan** `--cyan` |
| Solitaire | `--chapter-solitaire` | **Process Magenta-Red** `--magenta` |
| Stars | `--chapter-stars` | **Process Yellow** `--yellow` |
| Color Dots | `--chapter-color-dots` | **Process Green** `--green` |

A new game takes a new ink only if it holds `--cover-ink` at ≥ 4.5:1;
otherwise it shares one and tells itself apart by its glyph.

### Neutral

- **Paper** (`--paper`): the page. The app's ground, and the `theme-color`
  in `index.html` (`#f8fafd` / `#0d1013`) and the manifest (night).
- **Paper sunk** (`--paper-sunk`): a pressed row or tool, a folded corner.
- **Sheet** (`--sheet`): a loose sheet on the page — the resume card, a notice.
- **Desk** (`--desk`): beyond the booklet's width on a wide screen.
- **Ink** (`--ink`): all print — text, grid lines, frames, the inverted button.
  Also the focus ring (`--focus`).
- **Ink soft** (`--ink-soft`): dates, counts, captions, empty slots.
- **Rule** (`--rule`): thin lines between rows and Pipes cells.
- **Pencil** (`--pencil`): the player's marks and handwriting.
- **Cover ink** (`--cover-ink`): text and glyphs on a chapter ink, both books.

### Game inks

- **Water** (`--water`): a connected pipe's channel.
- **Card**, **card ink**, **card red** (`--card`, `--card-ink`, `--card-red`):
  a playing card's face stays paper-white at night (`--card` turns warm
  off-white), its black stays black.
- **Stamp** (`--stamp`): the « Résolu » stamp.
- **Pattern** (`--pattern`): translucent ink for a Stars region's halftone or
  hatch, printed over its tint.

### Named rules

**The Ink-Is-Not-Information Rule.** Colour never tells regions, balls or
states apart alone: a Stars region also has a pattern and heavy borders; a
conflict is circled in pencil and named in words; a wet pipe is filled, a dry
one hollow.

**The Near-Black-On-Ink Rule.** Text on a process ink is `--cover-ink`, in
both books. Never white on yellow, never ink-soft on a cover.

`src/presentation/styles/tokens-contrast.test.ts` holds every pair that meets
on screen; a new colour joins it in the commit that adds it.

## Typography

**Print font:** Archivo (variable: weight 100–900, width 62–125 %), with
`'Archivo fallback'` (Arial scaled by fontaine) then `system-ui`.
**Hand font:** Gochi Hand, with `'Segoe Print'`, `cursive`.

Both self-hosted from `public/fonts/` (latin, plus latin-ext for Archivo),
SIL OFL 1.1. Only `archivo-latin.woff2` is preloaded.

**Character:** a grotesque that stretches from poster-wide to newsprint-narrow,
and a felt-tip hand for what the player writes.

### Hierarchy

- **Masthead** (900, wdth 118 %, `--text-masthead`, 0.86): « Pastime » on the
  hub's cover band. Once per screen at most. It grows from 3.375rem on a
  307 px screen to 5rem on a 455 px one, through `sizes.fluid()`.
- **Number** (900, wdth 72 %, `--text-number` 34 px / `--text-number-large`
  44 px, 1, -0.02em): « N° 214 » in a game's band and on the resume card;
  « N° » set at about half the size, weight 800.
- **Cover title** (900, wdth 70 %, `--text-cover`, 0.95, uppercase): a
  chapter's cover on the hub.
- **Section** (800, wdth 92 %, `--text-section`): « Reprendre »,
  « Aujourd'hui », followed by a 1.5 px ink rule to the edge.
- **Body** (400, `--text-body`, 1.4, tabular numerals everywhere).
- **Label** (800, `--text-control`): buttons, theme choices, tools (tools at
  `--text-micro` 700 under their icon).
- **Meta** (600, `--text-meta`): the issue line, counts, captions, in
  `--ink-soft`.
- **Caps** (800, `--text-caps`, +0.07em, uppercase): the score box's terms
  (Temps, Record, Série).
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

Spacing steps from `--space-4xs` (0.125rem, 2 px) to `--space-2xl` (2.625rem,
42 px), in rem so they grow with the reader's font size; px figures in this file
are at the default 16 px. Section
heads sit `--space-xl` below what precedes them and `--space-s` above what
follows. The shell is a grid of notices / page / colophon; the colophon holds
the theme switch.

A game screen is a column: header band, board, note line (30 px tall even
empty, so the board never jumps), status line, then the tool bar pinned to
the bottom (`margin-top: auto`).

## Elevation & Depth

Flat print. Depth is drawn with lines and the paper's own shades, with one
exception: the resume card, a loose sheet on the page, casts
`drop-shadow(0 4px 8px var(--shadow))` (a filter, so the dog-ear's clipped
corner shadows too). Nothing else lifts.

## Shapes

Square by default: every box is drawn with `--print-line` (1.5 px ink) or a
heavier frame. Rounded corners exist only where the object is round in life:
playing cards (`--radius-card`, 5 px) and the stamp (`--radius-stamp`, 6 px).

Line weights (CSS): hairline 1 px (`--stroke-hair`, rows, separators),
print 1.5 px (`--stroke-thin`, boxes), bold 2 px (`--stroke-bold`, the tool
bar's top), frame 2.5 px (`--stroke-frame`, the score box), heavy 5 px
(`--stroke-heavy`, the masthead's top rule). The masthead rule is double:
5 px over 1.5 px, 4 px apart.

The resume card is a sheet with a dog-eared corner: `clip-path` cuts the top
right 30 px, and a triangle in `--paper-sunk` outlined in ink fills it.

## Components

### Masthead (built)

The hub's cover band: a row of five 12×8 px ink swatches (the four chapters,
then ink), « Pastime » in the masthead style, the double rule, then the issue
line — today's date in words, in the UI language (`hub.issue`), in
`--ink-soft`. `src/features/hub/masthead.tsx`.

### Theme switch (built)

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
- Pressed: `--paper-sunk` ground; a cover darkens with `filter:
  brightness(.95)`.

### Game header band (step 03)

68 px tall, in the game's chapter ink, text `--cover-ink`: a 48 px back
button, « N° 214 » in the number style with the size or variant beside it in
meta (« Étoiles · 8×8 »), the timer (800, wdth 90 %, `--text-timer`) and a
48 px pause button.

### Tool bar (step 03)

Three equal columns, 60 px tall, 2 px ink rule on top, 1 px `--rule`
between them; a 22 px stroke icon over a micro label (Annuler, Indice,
Recommencer). A toggled tool is `--paper-sunk`. Icons: 24-unit viewBox,
2-unit round strokes, drawn in the reference page's `<symbol>`s.

### Today's list and the chapter covers (step 03)

A contents page: each row 54 px tall — a 40 px chapter-ink tab with the
game's glyph, « N° 280 » condensed, the game's name, a dotted leader, then
« à faire » in meta or the time written in pencil with a pencil tick.
Below it, each chapter as a full-width cover block: its ink, an uppercase
condensed title, a sentence, a meta line, its glyph printed large and cropped
off the right edge. Glyphs (48-unit viewBox) are in the reference page.

### The board grammar (steps 04–07)

Every board is an inline SVG drawn to the full column width, ink on paper,
with a **5-unit outer frame**. Marks the player makes go in a layer filtered
by **the pencil filter**:

```html
<filter id="pencil" filterUnits="userSpaceOnUse" x="-40" y="-40" width="1000" height="1000">
  <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="4" result="grain"/>
  <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="wob"/>
  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.3 0 0 0 1.45" result="mask"/>
  <feComposite in="wob" in2="mask" operator="in"/>
</filter>
```

A pencil mark is a stroked path (`--pencil`, round caps and joins,
`pathLength="1"`) drawn in on creation: `stroke-dasharray: 1;
stroke-dashoffset: 1` animated to 0 over `--transition-base` (260 ms) with
`--ease-out`, static under reduced motion. Hand-drawn shapes come from
rough.js (`roughjs`, one stroke, seeded by the cell) so a mark looks the same
on every render.

- **Stars** (`--chapter-stars`): 44-unit cells. Each region is a tint of the
  chapter ink — `color-mix(in oklab, var(--chapter-stars) var(--tint-n),
  var(--paper))`, four steps, lower at night — plus its own pattern in
  `--pattern` (none, dots, hatch, horizontal lines, cross-hatch, reverse
  hatch, big dots, vertical lines). Lines: 0.9 units at 55 % within a
  region, 3.4 units square-capped between regions. A star is a hand-drawn
  five-point star (2.7 units); a cross two strokes (1.9 units, 80 %). A
  conflict is circled in pencil (a loop around both stars when they touch, one
  around each otherwise) and named in a hand note under the board (« deux
  étoiles se touchent »). The hint draws a dashed pencil box around the cells
  it is about, and says it in words below. Auto-cross draws its crosses at
  42 % against the player's 80 %, so the hand still reads as the player's.
  The cells are transparent buttons laid exactly over the print — the SVG
  only draws — so the board is played by pointer, keyboard (arrows, Enter)
  and screen reader alike. Region tints and patterns are given out so that
  bordering regions differ in both. Built: `src/features/stars/presentation/`.
- **Pipes** (`--chapter-pipes`): 40-unit tiles, cell lines 1 unit in
  `--rule`. A pipe is a 13-unit ink stroke with a 6-unit channel inside it:
  `--paper` when dry, `--water` when connected (a 200 ms colour change). A dead
  end ends in a bulb; the source is a square ink block with a water core. A tap
  turns the tile a quarter in `--transition-fast` (170 ms); a joining branch
  fills outward from the join, 28 ms per tile. A locked tile is tinted
  (`--tint-2` of the chapter ink) and boxed in pencil, drawn in. Built:
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
  a dashed pencil circle around the ball to send. A boss level carries a
  « BOSS » tab in the chapter ink on the status line. Small levels print at
  1.45 px per unit at most. Built: `src/features/color-dots/presentation/`.

### The stamp (step 03, the win screen)

« Résolu » in condensed 900 caps (`--text-stamp`, +0.04em) over « N° 214 ·
07.10 », in `--stamp`: a 4 px border, a 1.5 px outline 3 px outside it,
`--radius-stamp`, turned -9°, roughened by a grain filter, over the solved
board's corner. It presses once: scale 1.5 → 0.96 → 1 over `--transition-slow`
(520 ms) with `--ease-out`, then the ink spreads a hair; static under reduced
motion. Under it, a score box (2.5 px frame, three columns: Temps, Record,
Série) whose figures are written in pencil; a new record strikes the old one
through and circles the new one.

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
- **Do** write durations with their fallback, `var(--transition-base, 0)`:
  `reduced-motion.css` collapses them to 0.
- **Do** read `--tint-n` for a region's strength: it is redefined for the
  night book.

### Don't:
- **Don't** put white or `--ink-soft` text on a chapter ink.
- **Don't** use Gochi Hand for interface copy.
- **Don't** round a box that is not a card or the stamp.
- **Don't** add a shadow other than the resume sheet's.
- **Don't** tell anything apart by ink alone.

## Open issues

None.

