/**
 * How a deal is drawn: `winnable` is checked by the solver before it is shown,
 * `random` comes as the shuffle falls, for the purists.
 */
export const SOLITAIRE_VARIANTS = ['winnable', 'random'] as const

export type SolitaireVariantId = (typeof SOLITAIRE_VARIANTS)[number]

export const isSolitaireVariantId = (
  variantId: string
): variantId is SolitaireVariantId =>
  SOLITAIRE_VARIANTS.some((variant) => variant === variantId)
