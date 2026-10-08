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
  readWaitingGame,
  takeReadyLevel
} from './game-storage'
import { generateLevel } from './generator/generate-level'
import { preferredVariantId } from './play-record'
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

type NewLevel<Level> = { readonly level: Level; readonly puzzle: PuzzleRef }

/**
 * A level never played: the one printed ahead for this variant when it waits,
 * else one printed now.
 */
const printNewLevel = async <Level>({
  createWorker,
  game,
  levelSchema,
  signal
}: {
  createWorker: () => Worker
  game: GameDefinition
  levelSchema: z.ZodMiniType<Level>
  signal: AbortSignal
}): Promise<Result<NewLevel<Level>, 'aborted' | 'failed'>> => {
  const variantId = preferredVariantId({
    game,
    record: readPlayRecordOrEmpty()
  })
  const ready = takeReadyLevel({ gameId: game.id, variantId })
  const readyLevel = levelSchema.safeParse(ready?.level)
  if (ready !== null && readyLevel.success) {
    return Result.success({
      level: readyLevel.data,
      puzzle: { gameId: game.id, seed: ready.seed, variantId }
    })
  }

  const puzzle: PuzzleRef = { gameId: game.id, seed: randomSeed(), variantId }
  const printed = await generateLevel({
    createWorker,
    levelSchema,
    seed: puzzle.seed,
    signal,
    variantId
  })
  return printed.status === 'success'
    ? Result.success({ level: printed.data.level, puzzle })
    : printed
}

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

  const fresh = await printNewLevel({
    createWorker: module.createGeneratorWorker,
    game,
    levelSchema: module.engine.levelSchema,
    signal
  })
  if (fresh.status === 'failure') return { game, status: 'failed' }

  return {
    play: sealPlay({
      elapsedMs: 0,
      game,
      module,
      puzzle: fresh.data.puzzle,
      session: startSession(module.engine, fresh.data.level)
    }),
    playKey: playKeyOf(fresh.data.puzzle),
    status: 'ready'
  }
}

/**
 * The puzzle a game's page opens on: the one left mid-way, or a new one —
 * printed ahead when one waits, else by the game's generator in its worker.
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
