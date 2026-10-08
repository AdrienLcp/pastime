import { Result } from '@adrienlcp/result'
import { z } from 'zod/mini'

import { nowMs } from '@/infrastructure/clock'
import { randomSeed } from '@/infrastructure/random-seed'

import type { GameDefinition } from './game-definition'
import type { GameModule } from './game-module'
import { findGame } from './game-registry'
import { type GameSession, replaySession, startSession } from './game-session'
import {
  dropSavedGame,
  readPlayRecordOrEmpty,
  readWaitingGame
} from './game-storage'
import { generateLevel } from './generator/generate-level'
import { gameRecordOf, type PlayRecord } from './play-record'
import type { PuzzleRef } from './puzzle'
import type { SavedGame } from './saved-game'

/** A puzzle ready to play: its game opened, its board set as it was left. */
export type PreparedPlay<Level, State, Move, Hint> = {
  readonly game: GameDefinition
  readonly module: GameModule<Level, State, Move, Hint>
  readonly puzzle: PuzzleRef
  readonly session: GameSession<Level, State, Move>
  readonly elapsedMs: number
}

/** A prepared play whose game types stay sealed until the page opens it. */
export type SealedPlay = <Opened>(
  open: <Level, State, Move, Hint>(
    play: PreparedPlay<Level, State, Move, Hint>
  ) => Opened
) => Opened

export type GameLoaderData =
  | { readonly status: 'unknown_game' }
  | { readonly status: 'failed'; readonly game: GameDefinition }
  | {
      readonly status: 'ready'
      readonly play: SealedPlay
      /** Changes with each new puzzle, so the page starts afresh on it. */
      readonly playKey: string
    }

const preferredVariantId = (
  game: GameDefinition,
  record: PlayRecord
): string => {
  const preferred = gameRecordOf(record, game.id).preferredVariant
  return game.variants.some((variant) => variant.id === preferred) &&
    preferred !== null
    ? preferred
    : game.variants[0].id
}

const newPuzzle = (game: GameDefinition, record: PlayRecord): PuzzleRef => ({
  gameId: game.id,
  seed: randomSeed(),
  variantId: preferredVariantId(game, record)
})

const resumeSaved = <Level, State, Move, Hint>(
  module: GameModule<Level, State, Move, Hint>,
  saved: SavedGame
): Result<GameSession<Level, State, Move>, 'unreadable' | 'illegal'> => {
  const level = module.engine.levelSchema.safeParse(saved.level)
  const moves = z.array(module.engine.moveSchema).safeParse(saved.moves)
  if (!level.success || !moves.success) return Result.failure('unreadable')
  return replaySession({
    engine: module.engine,
    hintsUsed: saved.hintsUsed,
    level: level.data,
    moves: moves.data
  })
}

const sealPlay =
  <Level, State, Move, Hint>(
    play: PreparedPlay<Level, State, Move, Hint>
  ): SealedPlay =>
  (open) =>
    open(play)

const playKeyOf = (puzzle: PuzzleRef): string =>
  [puzzle.gameId, puzzle.variantId, puzzle.seed, nowMs()].join('/')

const preparePlay = async <Level, State, Move, Hint>({
  game,
  module,
  signal
}: {
  game: GameDefinition
  module: GameModule<Level, State, Move, Hint>
  signal: AbortSignal
}): Promise<GameLoaderData> => {
  const waiting = readWaitingGame(game.id)

  if (waiting.status === 'success' && waiting.data !== null) {
    const saved = waiting.data
    const session = resumeSaved(module, saved)
    if (session.status === 'success') {
      return {
        play: sealPlay({
          elapsedMs: saved.elapsedMs,
          game,
          module,
          puzzle: saved.puzzle,
          session: session.data
        }),
        playKey: playKeyOf(saved.puzzle),
        status: 'ready'
      }
    }
    dropSavedGame(game.id)
  }

  const puzzle = newPuzzle(game, readPlayRecordOrEmpty())
  const level = await generateLevel({
    createWorker: module.createGeneratorWorker,
    levelSchema: module.engine.levelSchema,
    seed: puzzle.seed,
    signal,
    variantId: puzzle.variantId
  })
  if (level.status === 'failure') return { game, status: 'failed' }

  return {
    play: sealPlay({
      elapsedMs: 0,
      game,
      module,
      puzzle,
      session: startSession(module.engine, level.data.level)
    }),
    playKey: playKeyOf(puzzle),
    status: 'ready'
  }
}

/**
 * The puzzle a game's page opens on: the one left mid-way, or a new one from a
 * random seed, printed by the game's generator in its worker.
 */
export const gameLoader = async ({
  gameId,
  signal
}: {
  gameId: string
  signal: AbortSignal
}): Promise<GameLoaderData> => {
  const game = findGame(gameId)
  if (game === null) return { status: 'unknown_game' }
  const sealedModule = await game.load()
  return sealedModule((module) => preparePlay({ game, module, signal }))
}
