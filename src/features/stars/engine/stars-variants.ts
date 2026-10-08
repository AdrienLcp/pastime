import type { StarsTechnique } from '../solver/stars-technique'
import type { StarsPuzzle } from './stars-level'

type StarsVariant = Pick<StarsPuzzle, 'size'> & {
  /** The easiest technique a level of this size may top out at. */
  readonly hardestAtLeast: StarsTechnique
}

/** Every size the book prints, by variant id. */
export const STARS_VARIANTS = {
  '7': { hardestAtLeast: 'confinement', size: 7 },
  '9': { hardestAtLeast: 'confinement', size: 9 },
  '11': { hardestAtLeast: 'confinement', size: 11 },
  '13': { hardestAtLeast: 'confinement', size: 13 },
  '15': { hardestAtLeast: 'confinement', size: 15 }
} as const satisfies Record<string, StarsVariant>

export type StarsVariantId = keyof typeof STARS_VARIANTS

export const isStarsVariantId = (
  variantId: string
): variantId is StarsVariantId => variantId in STARS_VARIANTS
