import { Result } from '@adrienlcp/result'
import { z } from 'zod/mini'

import { nowMs, today } from '@/infrastructure/clock'

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
import {
  dailyTimeOf,
  gameRecordOf,
  type PlayRecord,
  variantRecordOf
} from './play-record'
import {
  dailyPuzzle,
  freePuzzle,
  type PuzzleMode,
  type PuzzleRef,
  puzzleSeed
} from './puzzle'
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
      readonly status: 'daily_done'
      readonly game: GameDefinition
      readonly puzzle: PuzzleRef
      readonly elapsedMs: number
    }
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

const nextPuzzle = ({
  day,
  game,
  mode,
  record
}: {
  game: GameDefinition
  mode: PuzzleMode
  record: PlayRecord
  day: Temporal.PlainDate
}): PuzzleRef => {
  if (mode === 'daily') {
    return dailyPuzzle({ day, gameId: game.id, variantId: game.dailyVariant })
  }
  const variantId = preferredVariantId(game, record)
  return freePuzzle({
    gameId: game.id,
    number: variantRecordOf({ gameId: game.id, record, variantId }).nextNumber,
    variantId
  })
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
  [puzzle.gameId, puzzle.mode, puzzle.variantId, puzzle.number, nowMs()].join(
    '/'
  )

const preparePlay = async <Level, State, Move, Hint>({
  game,
  mode,
  module,
  signal
}: {
  game: GameDefinition
  module: GameModule<Level, State, Move, Hint>
  mode: PuzzleMode
  signal: AbortSignal
}): Promise<GameLoaderData> => {
  const day = today()
  const slot = { gameId: game.id, mode }
  const waiting = readWaitingGame(slot)

  if (waiting.status === 'success' && waiting.data !== null) {
    const saved = waiting.data
    const isStillCurrent =
      mode === 'free' || saved.puzzle.day === day.toString()
    const session = isStillCurrent ? resumeSaved(module, saved) : null
    if (session?.status === 'success') {
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
    dropSavedGame(slot)
  }

  const puzzle = nextPuzzle({
    day,
    game,
    mode,
    record: readPlayRecordOrEmpty()
  })
  const level = await generateLevel({
    createWorker: module.createGeneratorWorker,
    levelSchema: module.engine.levelSchema,
    number: puzzle.number,
    seed: puzzleSeed(puzzle),
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
 * The puzzle a game's page opens on: the one left mid-way, today's daily, or
 * the next free puzzle, printed by the game's generator in its worker. A daily
 * already solved today opens on its stamp, without loading the game at all.
 */
export const gameLoader = async ({
  gameId,
  mode,
  signal
}: {
  gameId: string
  mode: PuzzleMode
  signal: AbortSignal
}): Promise<GameLoaderData> => {
  const game = findGame(gameId)
  if (game === null) return { status: 'unknown_game' }

  if (mode === 'daily') {
    const day = today()
    const elapsedMs = dailyTimeOf({
      day,
      gameId,
      record: readPlayRecordOrEmpty()
    })
    if (elapsedMs !== null) {
      return {
        elapsedMs,
        game,
        puzzle: dailyPuzzle({ day, gameId, variantId: game.dailyVariant }),
        status: 'daily_done'
      }
    }
  }

  const sealedModule = await game.load()
  return sealedModule((module) => preparePlay({ game, mode, module, signal }))
}
