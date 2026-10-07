import type { StarsTechnique } from '../solver/stars-technique'
import type { StarsPuzzle } from './stars-level'

type StarsVariant = Pick<StarsPuzzle, 'size' | 'starsPerUnit'> & {
  /** The easiest technique a level of this size may top out at. */
  readonly hardestAtLeast: StarsTechnique
}

/** Every size the book prints, by variant id. */
export const STARS_VARIANTS = {
  '5': { hardestAtLeast: 'single', size: 5, starsPerUnit: 1 },
  '6': { hardestAtLeast: 'single', size: 6, starsPerUnit: 1 },
  '7': { hardestAtLeast: 'confinement', size: 7, starsPerUnit: 1 },
  '8': { hardestAtLeast: 'confinement', size: 8, starsPerUnit: 1 },
  '9': { hardestAtLeast: 'confinement', size: 9, starsPerUnit: 1 },
  '10': { hardestAtLeast: 'confinement', size: 10, starsPerUnit: 1 },
  '10-2': { hardestAtLeast: 'confinement', size: 10, starsPerUnit: 2 }
} as const satisfies Record<string, StarsVariant>

export type StarsVariantId = keyof typeof STARS_VARIANTS

export const isStarsVariantId = (
  variantId: string
): variantId is StarsVariantId => variantId in STARS_VARIANTS
