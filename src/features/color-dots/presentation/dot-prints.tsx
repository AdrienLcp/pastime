import type React from 'react'

import { BALL_WIDTH } from '../engine/color-dots-ride'
import { GRID_UNITS } from './color-dots-drawing'
import { inkOf } from './color-dots-inks'
import { DotSymbolMark } from './dot-symbol'

/** Drawn at the width the rules measure touching balls by. */
const BALL_RADIUS = (BALL_WIDTH * GRID_UNITS) / 2
const RING_OUTER = 15.5
const RING_INNER = 10
/** A ball seated in its ring, a rim of paper still showing around it. */
const SEATED_RADIUS = 7.5
const SEATED_SCALE = SEATED_RADIUS / BALL_RADIUS

/** A waiting ball, centred on the origin: its ink, outlined, and its symbol. */
export const BallPrint: React.FC<{ colour: number }> = ({ colour }) => {
  const { ink, onInk, symbol } = inkOf(colour)
  return (
    <g style={{ '--dot-ink': `var(${ink})`, '--dot-on-ink': `var(${onInk})` }}>
      <circle className='ball' r={BALL_RADIUS} />
      <DotSymbolMark className='ball-symbol' symbol={symbol} />
    </g>
  )
}

/**
 * A ring: a band of its ink between two printed lines, its symbol waiting in
 * the hole — or, filled, a ball seated in it. A ring whose ball is still on
 * its way fills once the ball gets there, `arrivesInMs` from now.
 */
export const RingPrint: React.FC<{
  colour: number
  isFilled: boolean
  arrivesInMs: number | null
  x: number
  y: number
}> = ({ arrivesInMs, colour, isFilled, x, y }) => {
  const { ink, onInk, symbol } = inkOf(colour)
  return (
    <g
      className='ring'
      data-arriving={arrivesInMs === null ? undefined : ''}
      data-filled={isFilled ? '' : undefined}
      style={{
        '--arrive-in': `${arrivesInMs ?? 0}ms`,
        '--dot-ink': `var(${ink})`,
        '--dot-on-ink': `var(${onInk})`
      }}
      transform={`translate(${x} ${y})`}
    >
      <circle className='ring-band' r={(RING_OUTER + RING_INNER) / 2} />
      <circle className='ring-edge' r={RING_OUTER} />
      <circle className='ring-edge' r={RING_INNER} />
      {isFilled ? (
        <g className='seated'>
          <circle className='seated-ball' r={SEATED_RADIUS} />
          <DotSymbolMark
            className='ball-symbol'
            scale={SEATED_SCALE}
            symbol={symbol}
          />
        </g>
      ) : (
        <DotSymbolMark className='ring-symbol' scale={0.7} symbol={symbol} />
      )}
    </g>
  )
}

/** Where a popped ball's ink lands, around its centre: [x, y, radius]. */
const SPLASH_DROPS: readonly (readonly [number, number, number])[] = [
  [-17, -9, 4.2],
  [-6, -20, 2.6],
  [12, -16, 3.6],
  [21, 2, 2.4],
  [13, 15, 4],
  [-3, 19, 2.2],
  [-19, 11, 3]
]

/**
 * A popped ball: its ink splashed onto the paper in drops flung out from
 * where it burst, left there for the rest of the level.
 */
export const InkSplash: React.FC<{ colour: number; x: number; y: number }> = ({
  colour,
  x,
  y
}) => (
  <g
    className='ink-splash'
    style={{ '--dot-ink': `var(${inkOf(colour).ink})` }}
    transform={`translate(${x} ${y})`}
  >
    {SPLASH_DROPS.map(([dropX, dropY, radius]) => (
      <circle
        className='ink-drop'
        cx={dropX}
        cy={dropY}
        key={`${dropX}:${dropY}`}
        r={radius}
        style={{ '--from-x': `${-dropX}px`, '--from-y': `${-dropY}px` }}
      />
    ))}
  </g>
)
