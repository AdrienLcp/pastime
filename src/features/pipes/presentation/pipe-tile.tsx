import type React from 'react'

import { isDeadEnd, pipePathOf, TILE_UNITS } from './pipes-drawing'

const MIDDLE = TILE_UNITS / 2

type PipeTileProps = {
  /** The tile as dealt; `degrees` turns it to how it faces now. */
  tile: number
  cell: number
  size: number
  degrees: number
  isSource: boolean
  isWet: boolean
  isLocked: boolean
  isHinted: boolean
  /** Steps the water waits before reaching this tile, when it just joined. */
  flowDelay: number
}

/**
 * One printed tile: an ink pipe with a channel inside, paper when dry, water
 * when joined to the source. A locked tile sits on a tinted ground.
 */
export const PipeTile: React.FC<PipeTileProps> = ({
  cell,
  degrees,
  flowDelay,
  isHinted,
  isLocked,
  isSource,
  isWet,
  size,
  tile
}) => {
  const path = pipePathOf(tile)
  const hasBulb = isDeadEnd(tile) && !isSource
  const column = cell % size
  const row = Math.floor(cell / size)

  return (
    <g
      className='tile'
      data-locked={isLocked || undefined}
      data-wet={isWet || undefined}
      style={{ '--flow-delay': flowDelay }}
      transform={`translate(${column * TILE_UNITS} ${row * TILE_UNITS})`}
    >
      {isLocked && (
        <rect className='lock-tint' height={TILE_UNITS} width={TILE_UNITS} />
      )}
      <g className='spin' style={{ transform: `rotate(${degrees}deg)` }}>
        <rect className='spin-box' height={TILE_UNITS} width={TILE_UNITS} />
        <path className='pipe' d={path} />
        <circle
          className='pipe-joint'
          cx={MIDDLE}
          cy={MIDDLE}
          r={hasBulb ? 10.5 : 6.5}
        />
        <path className='channel' d={path} />
        <circle
          className='channel-joint'
          cx={MIDDLE}
          cy={MIDDLE}
          r={hasBulb ? 6.5 : 3}
        />
        {isSource && (
          <>
            <rect className='source' height='24' width='24' x='8' y='8' />
            <rect
              className='source-water'
              height='15'
              width='15'
              x='12.5'
              y='12.5'
            />
            <rect className='source' height='6' width='6' x='17' y='17' />
          </>
        )}
      </g>
      {isHinted && (
        <rect
          className='hint-box'
          height={TILE_UNITS - 4}
          width={TILE_UNITS - 4}
          x='2'
          y='2'
        />
      )}
    </g>
  )
}
