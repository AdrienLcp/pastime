import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import type { ColorDotsHint } from '../engine/color-dots-hint'

const HINT_KEYS = {
  'dead-end': 'games.colorDots.hints.deadEnd',
  'next-ball': 'games.colorDots.hints.nextBall'
} as const satisfies Record<ColorDotsHint['kind'], PlainTranslationKey>

/** The hint's sentence: which ball goes next, or that an undo is due. */
export const colorDotsHintKey = (hint: ColorDotsHint): PlainTranslationKey =>
  HINT_KEYS[hint.kind]
