import type React from 'react'

import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import type { SealedGameModule } from './game-module'

/** A size or a difficulty: what a level is generated for. */
export type GameVariant = {
  readonly id: string
  readonly label: PlainTranslationKey
}

/**
 * What the hub and the frame know about a game before its chunk loads: enough
 * to print its cover, its line in today's list and its header band.
 */
export type GameDefinition = {
  readonly id: string
  readonly name: PlainTranslationKey
  /** The rule in one sentence, printed on the chapter's cover. */
  readonly rule: PlainTranslationKey
  /** The chapter's process ink, a token from `_tokens.sass`. */
  readonly chapterInk: `--chapter-${string}`
  /** The first one is where free play starts. */
  readonly variants: readonly [GameVariant, ...GameVariant[]]
  /** The variant of the daily puzzle, the same for everyone. */
  readonly dailyVariant: string
  /**
   * A variant only the daily puzzle prints, never offered in free play — a
   * boss level, say. `dailyVariant` then names it.
   */
  readonly dailyOnlyVariant?: GameVariant
  /** Whether the win screen prints the moves: a card game's, not a grid's. */
  readonly countsMoves: boolean
  /** The chapter's mark: on its cover, its tab in today's list. */
  readonly Glyph: React.FC
  readonly load: () => Promise<SealedGameModule>
}
