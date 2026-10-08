import type { Result } from '@adrienlcp/result'
import type React from 'react'
import type { z } from 'zod/mini'

import type { PlainTranslationKey } from '@/presentation/i18n/translation'

/**
 * A game's rules, pure: no React, no storage, no clock. `Level` is what the
 * generator prints and the save keeps; `State` is the board in play, rebuilt
 * from the level by replaying the moves.
 */
export type GameEngine<Level, State, Move, Hint> = {
  readonly start: (level: Level) => State
  /** `'illegal'` for a move the rules refuse; the frame then plays nothing. */
  readonly applyMove: (
    state: State,
    move: Move
  ) => Result<{ readonly board: State }, 'illegal'>
  readonly isWon: (state: State) => boolean
  /**
   * For a game a wrong move ends: the board stops there, and only an undo or
   * a restart plays on. A game nobody can lose leaves it out.
   */
  readonly isLost?: (state: State) => boolean
  /** The next logical step from here, or `null` when there is none to give. */
  readonly hint: (state: State) => Hint | null
  /** Checks a level read back from storage or from the generator's worker. */
  readonly levelSchema: z.ZodMiniType<Level>
  readonly moveSchema: z.ZodMiniType<Move>
  /** For a game that keeps points; a game without them leaves it out. */
  readonly scoring?: GameScoring<State, Move>
}

/** Points read off the play so far, so an undo takes them back exactly. */
export type GameScoring<State, Move> = {
  readonly scoreOf: (play: {
    readonly boards: readonly State[]
    readonly moves: readonly Move[]
  }) => number
  /** Added once the game is won, for the time it took. */
  readonly timeBonusOf: (elapsedMs: number) => number
}

export type BoardProps<State, Move, Hint> = {
  readonly state: State
  /** The hint on show, drawn on the board until the next move. */
  readonly hint: Hint | null
  readonly onMove: (move: Move) => void
  /** Won or paused: the board shows but takes no move. */
  readonly isLocked: boolean
}

/** What a game hands the frame once its chunk is loaded. */
export type GameModule<Level, State, Move, Hint> = {
  readonly engine: GameEngine<Level, State, Move, Hint>
  readonly Board: React.FC<BoardProps<State, Move, Hint>>
  /** The hint's explanation, in words: a hint is never only a highlight. */
  readonly hintKey: (hint: Hint) => PlainTranslationKey
  /** A fresh worker running the game's generator, through `serveGenerator`. */
  readonly createGeneratorWorker: () => Worker
  /**
   * How long the board takes to show the move that lost: the loss is told
   * once the player has seen it happen. Told at once when left out.
   */
  readonly lossSeenInMs?: (state: State) => number
}

/**
 * A game module whose four types stay sealed inside it. The registry holds
 * games of different types side by side; whoever opens one gets its types back
 * together, so a board is only ever handed the state its own engine made.
 */
export type SealedGameModule = <Opened>(
  open: <Level, State, Move, Hint>(
    module: GameModule<Level, State, Move, Hint>
  ) => Opened
) => Opened

export const sealGameModule =
  <Level, State, Move, Hint>(
    module: GameModule<Level, State, Move, Hint>
  ): SealedGameModule =>
  (open) =>
    open(module)
