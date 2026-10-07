/** Every size the book prints, by variant id: odd, so the source sits in the middle. */
export const PIPES_SIZES = {
  '5': 5,
  '7': 7,
  '9': 9,
  '11': 11,
  '13': 13
} as const satisfies Record<string, number>

export type PipesVariantId = keyof typeof PIPES_SIZES

export const isPipesVariantId = (
  variantId: string
): variantId is PipesVariantId => variantId in PIPES_SIZES
