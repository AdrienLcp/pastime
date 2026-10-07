import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import type { StarsHint } from '../engine/stars-hint'
import type { StarsReason } from '../solver/stars-step'

const REASON_KEYS = {
  'column-in-region': 'games.stars.hints.columnInRegion',
  'columns-in-regions': 'games.stars.hints.columnsInRegions',
  'full-column': 'games.stars.hints.fullColumn',
  'full-region': 'games.stars.hints.fullRegion',
  'full-row': 'games.stars.hints.fullRow',
  'next-to-star': 'games.stars.hints.nextToStar',
  'region-in-column': 'games.stars.hints.regionInColumn',
  'region-in-row': 'games.stars.hints.regionInRow',
  'regions-in-columns': 'games.stars.hints.regionsInColumns',
  'regions-in-rows': 'games.stars.hints.regionsInRows',
  'row-in-region': 'games.stars.hints.rowInRegion',
  'rows-in-regions': 'games.stars.hints.rowsInRegions',
  'single-column': 'games.stars.hints.singleColumn',
  'single-region': 'games.stars.hints.singleRegion',
  'single-row': 'games.stars.hints.singleRow',
  'touching-column': 'games.stars.hints.touchingColumn',
  'touching-region': 'games.stars.hints.touchingRegion',
  'touching-row': 'games.stars.hints.touchingRow'
} as const satisfies Record<StarsReason, PlainTranslationKey>

/** The hint's sentence: what is wrong with a mark, or why the step holds. */
export const starsHintKey = (hint: StarsHint): PlainTranslationKey => {
  switch (hint.kind) {
    case 'wrong-star':
      return 'games.stars.hints.wrongStar'
    case 'wrong-cross':
      return 'games.stars.hints.wrongCross'
    case 'step':
      return REASON_KEYS[hint.step.reason]
    default:
      return hint satisfies never
  }
}
