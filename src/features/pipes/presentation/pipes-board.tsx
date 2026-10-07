import type React from 'react'
import { useMemo, useState } from 'react'

import type { BoardProps } from '@/features/game-frame/game-module'
import { Button } from '@/presentation/components/button'
import {
  TurnBackIcon,
  TurnClockwiseIcon
} from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { openSidesOf, type Side } from '../engine/pipes-grid'
import type { PipesHint } from '../engine/pipes-hint'
import { sourceOf } from '../engine/pipes-level'
import { currentTilesOf, waterDepthsOf } from '../engine/pipes-network'
import type { PipesMove, PipesState } from '../engine/pipes-state'
import { PipeTile } from './pipe-tile'
import { FRAME_MARGIN, TILE_UNITS, tileLinesOf } from './pipes-drawing'
import {
  otherWayOf,
  type TurnDirection,
  useTileGestures
} from './use-tile-gestures'
import { useTileSpins } from './use-tile-spins'
import { useWaterFlow } from './use-water-flow'

import './pipes-board.sass'

const SIDE_KEYS = {
  1: 'games.pipes.sides.north',
  2: 'games.pipes.sides.east',
  4: 'games.pipes.sides.south',
  8: 'games.pipes.sides.west'
} as const satisfies Record<Side, string>

const DIRECTION_KEYS = {
  back: 'games.pipes.direction.back',
  clockwise: 'games.pipes.direction.clockwise'
} as const satisfies Record<TurnDirection, string>

const ARROW_STEPS = {
  ArrowDown: { columns: 0, rows: 1 },
  ArrowLeft: { columns: -1, rows: 0 },
  ArrowRight: { columns: 1, rows: 0 },
  ArrowUp: { columns: 0, rows: -1 }
} as const

const isArrow = (key: string): key is keyof typeof ARROW_STEPS =>
  key in ARROW_STEPS

const TILE_ATTRIBUTE = 'data-tile'

const cellsOf = (size: number) =>
  Array.from({ length: size * size }, (_, cell) => cell)

/**
 * A Pipes grid printed in ink, the water running live through every pipe
 * joined to the source. Tiles are buttons laid over the print: tap to turn,
 * long press to lock, or the keyboard.
 */
export const PipesBoard: React.FC<
  BoardProps<PipesState, PipesMove, PipesHint>
> = ({ hint, isLocked, onMove, state }) => {
  const translate = useTranslate()
  const [direction, setDirection] = useState<TurnDirection>('clockwise')
  const [focusedTile, setFocusedTile] = useState(0)
  const { level } = state
  const { size } = level
  const { tileProps } = useTileGestures({ direction, onMove })

  const tiles = useMemo(() => currentTilesOf(state), [state])
  const depths = useMemo(() => waterDepthsOf({ level, tiles }), [level, tiles])
  const flowDelays = useWaterFlow(depths)
  const spins = useTileSpins(state.turns)
  const source = sourceOf(level)
  const span = size * TILE_UNITS
  const box = span + 2 * FRAME_MARGIN

  const moveFocus = (event: React.KeyboardEvent<HTMLElement>, cell: number) => {
    if (!isArrow(event.key)) return
    event.preventDefault()
    const step = ARROW_STEPS[event.key]
    const row = Math.min(
      size - 1,
      Math.max(0, Math.floor(cell / size) + step.rows)
    )
    const column = Math.min(size - 1, Math.max(0, (cell % size) + step.columns))
    const next = row * size + column
    setFocusedTile(next)
    event.currentTarget.parentElement
      ?.querySelector<HTMLElement>(`[${TILE_ATTRIBUTE}="${next}"]`)
      ?.focus()
  }

  const tileLabel = (cell: number) =>
    [
      translate('games.pipes.tile', {
        column: (cell % size) + 1,
        row: Math.floor(cell / size) + 1
      }),
      cell === source ? translate('games.pipes.source') : null,
      translate('games.pipes.opens', {
        sides: openSidesOf(tiles[cell] ?? 0)
          .map((side) => translate(SIDE_KEYS[side]))
          .join(', ')
      }),
      translate(depths.has(cell) ? 'games.pipes.wet' : 'games.pipes.dry'),
      state.locked[cell] ? translate('games.pipes.locked') : null
    ]
      .filter((part) => part !== null)
      .join(', ')

  const TurnIcon = direction === 'clockwise' ? TurnClockwiseIcon : TurnBackIcon

  return (
    <div className='pipes-board' style={{ '--size': size }}>
      <div className='sheet'>
        <svg
          aria-hidden={!isLocked}
          aria-label={
            isLocked ? translate('games.pipes.board', { size }) : undefined
          }
          className='print'
          role={isLocked ? 'img' : undefined}
          viewBox={`${-FRAME_MARGIN} ${-FRAME_MARGIN} ${box} ${box}`}
        >
          <path className='tile-lines' d={tileLinesOf(size)} />
          {cellsOf(size).map((cell) => (
            <PipeTile
              cell={cell}
              degrees={spins[cell] ?? 0}
              flowDelay={flowDelays.get(cell) ?? 0}
              isHinted={hint?.cell === cell}
              isLocked={state.locked[cell] ?? false}
              isSource={cell === source}
              isWet={depths.has(cell)}
              key={cell}
              size={size}
              tile={level.tiles[cell] ?? 0}
            />
          ))}
          <rect className='frame' height={span} width={span} />
        </svg>
        {!isLocked && (
          <fieldset
            aria-label={translate('games.pipes.board', { size })}
            className='tiles'
            onContextMenu={(event) => event.preventDefault()}
          >
            {cellsOf(size).map((cell) => {
              const gestures = tileProps(cell)
              return (
                <button
                  aria-label={tileLabel(cell)}
                  className='tile-button'
                  {...{ [TILE_ATTRIBUTE]: cell }}
                  key={cell}
                  {...gestures}
                  onFocus={() => setFocusedTile(cell)}
                  onKeyDown={(event) => {
                    moveFocus(event, cell)
                    gestures.onKeyDown(event)
                  }}
                  tabIndex={cell === focusedTile ? 0 : -1}
                  type='button'
                />
              )
            })}
          </fieldset>
        )}
      </div>
      {!isLocked && (
        <div className='status-line'>
          <p className='water-count'>
            {translate('games.pipes.waterCount', {
              count: depths.size,
              total: level.tiles.length
            })}
          </p>
          <Button
            className='direction'
            onPress={() => setDirection(otherWayOf(direction))}
          >
            <TurnIcon aria-hidden='true' />
            {translate(DIRECTION_KEYS[direction])}
          </Button>
        </div>
      )}
    </div>
  )
}
