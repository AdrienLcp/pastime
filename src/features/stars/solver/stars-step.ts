import type { StarsUnitKind } from '../engine/stars-grid'
import type { StarsTechnique } from './stars-technique'

type Plural<Kind extends StarsUnitKind> = `${Kind}s`

/** Why a step holds: one sentence each, which the hint prints. */
export type StarsReason =
  | 'next-to-star'
  | `full-${StarsUnitKind}`
  | `single-${StarsUnitKind}`
  | `touching-${StarsUnitKind}`
  | 'region-in-row'
  | 'region-in-column'
  | 'row-in-region'
  | 'column-in-region'
  | `${Plural<'region'>}-in-${Plural<'row' | 'column'>}`
  | `${Plural<'row' | 'column'>}-in-regions`

/** One deduction: these cells are decided, for this reason, by this technique. */
export type StarsStep = {
  readonly technique: StarsTechnique
  readonly reason: StarsReason
  readonly verdict: 'star' | 'no-star'
  /** The cells the step decides, all of them still open before it. */
  readonly cells: readonly number[]
  /** The cells the reasoning reads: the unit or the star it starts from. */
  readonly focus: readonly number[]
}
