# Build plan — index

**Reading a step.** This table is enough to choose; then open only the file of
the step taken. A delivered step keeps its line here (with the date) and loses
its file; what it taught goes into `docs/architecture.md` or the game's
`docs/games/<game>.md`.

Steps run in order: each one ends deployed and seen in a browser (sound at 0).

| # | Step | In one line | State |
|---|---|---|---|
| 01 | Bootstrap | Root app from toolkit's web-app template, PWA from Séance, CI, Pages on `pastime.adrienlcp.com` | done 2026-10-07 |
| 02 | Design direction | `impeccable`: full example pages per direction (hub + one board per game), Adrien picks | done 2026-10-07 |
| 03 | Hub and game frame | Registry, hub, timer/undo/hint/win screen, saves, stats, settings, daily seed | done 2026-10-07 |
| 04 | Stars | Engine, logical solver, unique-solution generator, difficulty grading | done 2026-10-07 |
| 05 | Pipes | Spanning-tree generator, unique solution, live water fill | done 2026-10-07 |
| 06 | Solitaire | Klondike draw 1, drag + tap-to-move, winnable deals only | done 2026-10-07 |
| 07 | Color Dots | Tree board, lose on a blocked tap, reverse generator, hard progression with boss levels | done 2026-10-08 |
| 08 | Launch | Offline/install polish, Lighthouse, README, portfolio project page | to do |
| 09 | Rotate Rings | Rules drafted from a screenshot; confirm with a recording first | later |
