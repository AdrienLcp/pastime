import type React from 'react'
import { useRef } from 'react'

import type { BoardProps } from '@/features/game-frame/game-module'
import { elapsedClockMs } from '@/infrastructure/clock'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ColorDotsHint } from '../engine/color-dots-hint'
import { type ColorDotsRide, RIDE_MS_PER_STEP } from '../engine/color-dots-ride'
import type { ColorDotsMove, ColorDotsState } from '../engine/color-dots-state'
import { neighboursOf, routeLength } from '../engine/color-dots-tree'
import {
  FRAME_MARGIN,
  GRID_UNITS,
  pointOf,
  printAreaOf
} from './color-dots-drawing'
import { inkOf } from './color-dots-inks'
import { BallPrint, InkSplash, RingPrint } from './dot-prints'
import { useFreshRides } from './use-fresh-rides'
import {
  isMotionReduced,
  msLeftOf,
  stopPointOf,
  useRideMotion
} from './use-ride-motion'

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
 * it riding to its ring while the balls sent before still roll, and tells the
 * engine how long after the previous tap it came.
 */
export const ColorDotsBoard: React.FC<
  BoardProps<ColorDotsState, ColorDotsMove, ColorDotsHint>
> = ({ hint, isLocked, onMove, state }) => {
  const translate = useTranslate()
  const { clockMs, level, rides, spots } = state
  const freshRides = useFreshRides({ isLocked, rides })
  const ridesRef = useRideMotion({ clockMs, level, rides: freshRides })
  const lastTapAtRef = useRef<number | null>(null)
  const isStill = freshRides === null || isMotionReduced()
  const msLeft = (ride: ColorDotsRide) =>
    isStill ? 0 : msLeftOf({ clockMs, level, ride })
  const newestRide = freshRides?.at(-1)
  const rideMs =
    newestRide === undefined || isStill
      ? 0
      : routeLength({ route: newestRide.route, tree: level }) * RIDE_MS_PER_STEP

  const tap = (ball: number) => {
    const now = elapsedClockMs()
    const since = lastTapAtRef.current
    lastTapAtRef.current = now
    const isFollowingOn =
      since !== null && freshRides === rides && !isMotionReduced()
    onMove(
      isFollowingOn ? { afterMs: Math.round(now - since), ball } : { ball }
    )
  }

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
  const popped = rides.find((ride) => ride.end.kind === 'pops') ?? null
  const poppedAt = popped === null ? null : stopPointOf({ level, ride: popped })
  const landingIn = new Map(
    (freshRides ?? []).flatMap((ride) => {
      const ring = ride.route.at(-1)
      return ride.end.kind === 'lands' && ring !== undefined
        ? [[ring, msLeft(ride)] as const]
        : []
    })
  )
  const hintedBall = hint?.kind === 'next-ball' ? hint.ball : null

  const waitingBalls = spots
    .flatMap((spot, node) =>
      spot.kind === 'ball' ? [{ colour: spot.colour, node }] : []
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
                case 'ring': {
                  const arrivesInMs = landingIn.get(node) ?? null
                  return (
                    <RingPrint
                      arrivesInMs={arrivesInMs}
                      colour={spot.colour}
                      isFilled={spot.isFilled}
                      key={
                        arrivesInMs === null
                          ? node
                          : `${node}@${clockMs}/${rides.length}`
                      }
                      x={x}
                      y={y}
                    />
                  )
                }
                case 'ball':
                  return (
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

            <g className='rides' ref={ridesRef}>
              {freshRides?.map((ride) => (
                <g className='traveller' data-ride={ride.ball} key={ride.ball}>
                  <BallPrint colour={ride.colour} />
                </g>
              ))}
            </g>

            {popped !== null && poppedAt !== null && (
              <g
                className='pop'
                data-still={freshRides === null ? '' : undefined}
                style={{ '--pop-in': `${msLeft(popped)}ms` }}
              >
                <InkSplash
                  colour={popped.colour}
                  x={poppedAt.x}
                  y={poppedAt.y}
                />
                <path
                  className='pop-loop'
                  d={PENCIL_LOOP}
                  pathLength='1'
                  transform={`translate(${poppedAt.x - LOOP_SIZE / 2} ${poppedAt.y - LOOP_SIZE / 2}) scale(${LOOP_SIZE / 100})`}
                  vectorEffect='non-scaling-stroke'
                />
              </g>
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
                    onClick={() => tap(ball.node)}
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
