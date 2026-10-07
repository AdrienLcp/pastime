import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import type { PipesHint } from '../engine/pipes-hint'

/** The hint's sentence: a lock to undo, or a tile with one way left to face. */
export const pipesHintKey = (hint: PipesHint): PlainTranslationKey => {
  switch (hint.kind) {
    case 'wrong-lock':
      return 'games.pipes.hints.wrongLock'
    case 'forced':
      return 'games.pipes.hints.forced'
    default:
      return hint satisfies never
  }
}
