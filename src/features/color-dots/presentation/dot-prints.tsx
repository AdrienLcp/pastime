import type React from 'react'

import { inkOf } from './color-dots-inks'
import { DotSymbolMark } from './dot-symbol'

const BALL_RADIUS = 13
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
 * the hole — or, filled, a ball seated in it. A ring filled by the last tap
 * fills once the ball gets there.
 */
export const RingPrint: React.FC<{
  colour: number
  isFilled: boolean
  isArriving: boolean
  x: number
  y: number
}> = ({ colour, isArriving, isFilled, x, y }) => {
  const { ink, onInk, symbol } = inkOf(colour)
  return (
    <g
      className='ring'
      data-arriving={isArriving ? '' : undefined}
      data-filled={isFilled ? '' : undefined}
      style={{ '--dot-ink': `var(${ink})`, '--dot-on-ink': `var(${onInk})` }}
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
