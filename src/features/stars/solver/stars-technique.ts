/**
 * The solver's techniques, easiest first: the order it tries them in, and the
 * scale a level's difficulty is read on — its hardest technique.
 */
export const STARS_TECHNIQUES = [
  'next-to-star',
  'full-unit',
  'single',
  'confinement',
  'touching',
  'pair',
  'triple'
] as const

export type StarsTechnique = (typeof STARS_TECHNIQUES)[number]

/** Placing the stars' consequences: what auto-cross does for the player. */
export const BASIC_TECHNIQUES: readonly StarsTechnique[] = [
  'next-to-star',
  'full-unit'
]

export const techniqueRank = (technique: StarsTechnique): number =>
  STARS_TECHNIQUES.indexOf(technique)

export const harderTechnique = ({
  current,
  next
}: {
  current: StarsTechnique
  next: StarsTechnique
}): StarsTechnique =>
  techniqueRank(next) > techniqueRank(current) ? next : current
