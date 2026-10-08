/**
 * What a level is built to: its size on the grid, its rings and inks, and how
 * many tempting wrong taps it must hold at the least — counted along its
 * solution by `countTraps`, the thresholds set from measured levels.
 */
export type ColorDotsRecipe = {
  readonly boss: boolean
  readonly columns: number
  readonly rows: number
  readonly rings: number
  readonly colours: number
  readonly minTraps: number
}

/** The variant free play numbers its levels in. */
export const NUMBERED_VARIANT = 'numbered'

/** The daily puzzle's variant: a boss level every day. */
export const BOSS_VARIANT = 'boss'

const BOSS: ColorDotsRecipe = {
  boss: true,
  colours: 5,
  columns: 7,
  minTraps: 24,
  rings: 14,
  rows: 10
}

const HARD: ColorDotsRecipe = {
  boss: false,
  colours: 5,
  columns: 7,
  minTraps: 16,
  rings: 11,
  rows: 9
}

/**
 * The first levels, one per number: real difficulty is reached by the tenth,
 * the first boss.
 */
const OPENING: readonly ColorDotsRecipe[] = [
  { ...HARD, colours: 2, minTraps: 1, rings: 4, rows: 7 },
  { ...HARD, colours: 3, minTraps: 2, rings: 5, rows: 7 },
  { ...HARD, colours: 3, minTraps: 3, rings: 6, rows: 8 },
  { ...HARD, colours: 3, minTraps: 4, rings: 7, rows: 8 },
  { ...HARD, colours: 4, minTraps: 6, rings: 8 },
  { ...HARD, colours: 4, minTraps: 8, rings: 9 },
  { ...HARD, colours: 4, minTraps: 10, rings: 10 },
  { ...HARD, colours: 5, minTraps: 12, rings: 10 },
  { ...HARD, minTraps: 14 }
]

/** Past the opening, the rhythm: two hard levels, then a boss. */
const RHYTHM = 3

export const recipeOf = ({
  number,
  variantId
}: {
  number: number
  variantId: string
}): ColorDotsRecipe => {
  if (variantId === BOSS_VARIANT) return BOSS
  const opening = OPENING[number - 1]
  if (opening !== undefined) return opening
  return (number - OPENING.length - 1) % RHYTHM === 0 ? BOSS : HARD
}
