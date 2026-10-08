/**
 * What a level is built to: its size on the grid, its rings and inks, and how
 * many tempting wrong taps it must hold at the least — counted along its
 * solution by `countTraps`, the thresholds set from measured levels.
 */
export type ColorDotsRecipe = {
  readonly columns: number
  readonly rows: number
  readonly rings: number
  readonly colours: number
  readonly minTraps: number
}

/** Every difficulty the book prints, by variant id. */
export const COLOR_DOTS_TIERS = {
  easy: { colours: 4, columns: 7, minTraps: 6, rings: 8, rows: 9 },
  expert: { colours: 5, columns: 7, minTraps: 24, rings: 14, rows: 10 },
  hard: { colours: 5, columns: 7, minTraps: 16, rings: 11, rows: 9 }
} as const satisfies Record<string, ColorDotsRecipe>

export type ColorDotsTierId = keyof typeof COLOR_DOTS_TIERS

export const isColorDotsTierId = (
  variantId: string
): variantId is ColorDotsTierId => variantId in COLOR_DOTS_TIERS
