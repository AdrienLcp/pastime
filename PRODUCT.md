# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adrien first: he plays small solo puzzle and card games on his phone in short
sessions, one-handed, often in the evening, and is tired of the ad-ridden apps
he plays them in. Then anyone with the same habit who finds the app.

## Product Purpose

Pastime gathers small solo puzzle and card games — Stars, Pipes, Klondike
solitaire, Color Dots, more later — in one installable web app that works
offline, with random levels on demand, as many as wanted. Success is Adrien
deleting the ad apps and opening Pastime instead, every evening, without
friction.

## Positioning

Every level is generated on the device and checked by the game's solver
before it is shown: no puzzle ever needs a guess, every « winnable » deal is
winnable. The next level is printed ahead while one is played, so a new game
never waits. Nothing to pay, nothing to sign in to, nothing between the
player and the board.

## Operating Context

- Phone portrait, one hand, 360 px wide and up; also usable on desktop.
- Installed on the home screen as a PWA, often played offline.
- Evening play is the common case: dark mode is first-class.
- Sessions of a few minutes, interrupted any time: a game in progress resumes
  exactly where it was, even after the app was killed.
- Sound and haptics exist but are off by default.

## Capabilities and Constraints

- Static files on Cloudflare Pages, zero running cost, no server; every save,
  statistic and setting lives on the device.
- One engine per game, pure and tested, apart from its screen. Adding a game
  never touches another game's folder; the hub reads a registry.
- Shared game frame: timer, undo, restart, hint (named in words), pause, win
  screen, save/resume, best times; a game opens straight on a level of the variant
  played last, and the size, deal or difficulty changes from the tools.
- French is the reference language, English must fit.
- WCAG AA in light and dark; colour never alone tells regions, balls or states
  apart; touch targets ≥ 44 px; boards fit a 360 px phone without scrolling;
  reduced motion respected; fonts self-hosted.
- Rotate Rings is drafted but not confirmed; other games in `docs/ideas.md`
  are not planned.

## Brand Commitments

- Name: **Pastime** (renamed from Récré on 2026-10-07).
- No ads, no account, no dark patterns, no gamified pressure: no coins, gems,
  lives, energy, badges or "rate us".

## Evidence on Hand

No users, reviews or statistics yet: none may be invented. Game rules are
written in `docs/games/<game>.md`.

## Product Principles

1. The board is the product: nothing competes with it for attention.
2. Every level is fair — solvable by logic, never a guess.
3. Calm over compulsion: a small moment of delight on a win, never a casino.
4. Interruptible: closing the app mid-game costs nothing.
5. Each game keeps its own character inside one family resemblance.

## Accessibility & Inclusion

WCAG AA in both themes, a border, symbol or word alongside every colour
distinction, and Stars' region inks kept apart for every colour vision
(colour-blind players), 44 px targets, reduced motion honoured.
