import type React from 'react'

import type { BoardProps } from '@/features/game-frame/game-module'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ColorDotsHint } from '../engine/color-dots-hint'
import type { ColorDotsMove, ColorDotsState } from '../engine/color-dots-state'
import { neighboursOf } from '../engine/color-dots-tree'
import {
  FRAME_MARGIN,
  GRID_UNITS,
  pointOf,
  printAreaOf
} from './color-dots-drawing'
import { inkOf } from './color-dots-inks'
import { BallPrint, RingPrint } from './dot-prints'
import { rideMsOf, useBallTravel } from './use-ball-travel'
import { useFreshTap } from './use-fresh-tap'

import './color-dots-board.sass'

/** The pencil's loop, in a 100-unit box: it overshoots where it closes. */
const PENCIL_LOOP =
  'M58 9C82 10 95 27 93 50C91 74 72 92 48 91C25 90 7 73 8 49C9 27 26 10 50 8C60 7 71 10 78 15'

const LOOP_SIZE = 46

/** Three lines or more meet at a joint drawn as a block; two run straight on. */
const JOINT_DEGREE = 3

const JOINT_SIDE = 7

/**
 * A Color Dots board printed in ink: lines, rings and balls, each colour with
 * its symbol. Every waiting ball is a button laid over the print; a tap sends
 * it riding to its ring.
 */
export const ColorDotsBoard: React.FC<
  BoardProps<ColorDotsState, ColorDotsMove, ColorDotsHint>
> = ({ hint, isLocked, onMove, state }) => {
  const translate = useTranslate()
  const { lastTap, level, spots } = state
  const freshTap = useFreshTap({ isLocked, lastTap })
  const rideMs = rideMsOf({ level, tap: freshTap })
  const travellerRef = useBallTravel({ level, rideMs, tap: freshTap })

  const area = printAreaOf(level)
  const box = {
    height: area.height + 2 * FRAME_MARGIN,
    width: area.width + 2 * FRAME_MARGIN
  }
  const neighbours = neighboursOf(level)
  const nodeIds = level.nodes.map((_, node) => node)
  const isPresent = (node: number) => {
    const spot = spots[node]
    return spot !== undefined && spot.kind !== 'gone'
  }
  const strandedTap = lastTap?.kind === 'blocked' ? lastTap : null
  const arrivedRing =
    freshTap?.kind === 'arrived' ? freshTap.route.at(-1) : undefined
  const hintedBall = hint?.kind === 'next-ball' ? hint.ball : null

  const waitingBalls = spots
    .flatMap((spot, node) =>
      spot.kind === 'ball' && node !== strandedTap?.ball
        ? [{ colour: spot.colour, node }]
        : []
    )
    .toSorted((first, second) => {
      const a = level.nodes[first.node]
      const b = level.nodes[second.node]
      if (a === undefined || b === undefined) return 0
      return a.y - b.y || a.x - b.x
    })

  const ballLabel = ({ colour, node }: { colour: number; node: number }) => {
    const at = level.nodes[node]
    return translate('games.colorDots.ball', {
      column: (at?.x ?? 0) + 1,
      ink: translate(inkOf(colour).name),
      row: (at?.y ?? 0) + 1
    })
  }

  const placeOf = (units: number, span: number) =>
    `${((units + FRAME_MARGIN) / span) * 100}%`
  const buttonSize = {
    height: `${(GRID_UNITS / box.height) * 100}%`,
    width: `${(GRID_UNITS / box.width) * 100}%`
  }

  const strandedAt = (() => {
    const stop = strandedTap?.route.at(-1)
    const node = stop === undefined ? undefined : level.nodes[stop]
    return node === undefined ? null : pointOf(node)
  })()
  const blockerAt = (() => {
    const node =
      strandedTap === null ? undefined : level.nodes[strandedTap.blocker]
    return node === undefined ? null : pointOf(node)
  })()

  return (
    <div
      className='color-dots-board'
      data-fills-height
      style={{ '--ride': `${rideMs}ms` }}
    >
      <div className='stage'>
        <div
          className='sheet'
          style={{ '--print-height': box.height, '--print-width': box.width }}
        >
          <svg
            aria-hidden={!isLocked}
            aria-label={
              isLocked ? translate('games.colorDots.board') : undefined
            }
            className='print'
            role={isLocked ? 'img' : undefined}
            viewBox={`${-FRAME_MARGIN} ${-FRAME_MARGIN} ${box.width} ${box.height}`}
          >
            <g className='tracks'>
              {level.links.map(([from, to]) => {
                const start = level.nodes[from]
                const end = level.nodes[to]
                if (start === undefined || end === undefined) return null
                const a = pointOf(start)
                const b = pointOf(end)
                return (
                  <line
                    data-gone={
                      isPresent(from) && isPresent(to) ? undefined : ''
                    }
                    key={`${from}-${to}`}
                    x1={a.x}
                    x2={b.x}
                    y1={a.y}
                    y2={b.y}
                  />
                )
              })}
            </g>

            {nodeIds.map((node) => {
              const spot = spots[node]
              const at = level.nodes[node]
              if (spot === undefined || at === undefined) return null
              const { x, y } = pointOf(at)
              switch (spot.kind) {
                case 'joint': {
                  const degree = (neighbours[node] ?? []).filter(
                    isPresent
                  ).length
                  return degree < JOINT_DEGREE ? null : (
                    <rect
                      className='joint'
                      height={JOINT_SIDE}
                      key={node}
                      width={JOINT_SIDE}
                      x={x - JOINT_SIDE / 2}
                      y={y - JOINT_SIDE / 2}
                    />
                  )
                }
                case 'ring':
                  return (
                    <RingPrint
                      colour={spot.colour}
                      isArriving={node === arrivedRing}
                      isFilled={spot.isFilled}
                      key={node}
                      x={x}
                      y={y}
                    />
                  )
                case 'ball':
                  return node === strandedTap?.ball ? null : (
                    <g key={node} transform={`translate(${x} ${y})`}>
                      <BallPrint colour={spot.colour} />
                      {node === hintedBall && (
                        <circle className='hint-ring' r={GRID_UNITS / 2 - 1} />
                      )}
                    </g>
                  )
                case 'gone':
                  return null
                default:
                  return spot satisfies never
              }
            })}

            {freshTap?.kind === 'arrived' && (
              <g className='traveller' ref={travellerRef}>
                <BallPrint colour={freshTap.colour} />
              </g>
            )}

            {strandedTap !== null && strandedAt !== null && (
              <g
                className='stranded'
                ref={travellerRef}
                style={{
                  transform: `translate(${strandedAt.x}px, ${strandedAt.y}px)`
                }}
              >
                <BallPrint colour={strandedTap.colour} />
              </g>
            )}

            {blockerAt !== null && (
              <path
                className='blocker-loop'
                d={PENCIL_LOOP}
                pathLength='1'
                transform={`translate(${blockerAt.x - LOOP_SIZE / 2} ${blockerAt.y - LOOP_SIZE / 2}) scale(${LOOP_SIZE / 100})`}
                vectorEffect='non-scaling-stroke'
              />
            )}

            <rect className='frame' height={area.height} width={area.width} />
          </svg>

          {!isLocked && (
            <fieldset
              aria-label={translate('games.colorDots.board')}
              className='balls'
            >
              {waitingBalls.map((ball) => {
                const at = level.nodes[ball.node]
                if (at === undefined) return null
                const { x, y } = pointOf(at)
                return (
                  <button
                    aria-label={ballLabel(ball)}
                    className='ball-button'
                    key={ball.node}
                    onClick={() => onMove({ ball: ball.node })}
                    style={{
                      ...buttonSize,
                      left: placeOf(x, box.width),
                      top: placeOf(y, box.height)
                    }}
                    type='button'
                  />
                )
              })}
            </fieldset>
          )}
        </div>
      </div>
      {!isLocked && (
        <div className='status-line'>
          <p className='ball-count'>
            {translate('games.colorDots.ballCount', {
              count: waitingBalls.length
            })}
          </p>
        </div>
      )}
    </div>
  )
}
