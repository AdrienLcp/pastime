import type React from 'react'
import { useMemo } from 'react'

import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'
import {
  CELL_UNITS,
  cellsOf,
  gridLinesOf,
  REGION_PATTERNS,
  type RegionPattern,
  regionLooksOf
} from './stars-drawing'

export const pencilFilterOf = (idPrefix: string) => `${idPrefix}-pencil`

const patternIdOf = ({
  idPrefix,
  pattern
}: {
  idPrefix: string
  pattern: RegionPattern
}) => `${idPrefix}-${pattern}`

/** Each pattern's tile, in board units, inked in `--pattern`. */
const PATTERN_TILES = {
  'back-hatch': {
    content: <path d='M0 0L6 6M-1 5L1 7M5 -1L7 1' strokeWidth='1' />,
    side: 6
  },
  'big-dots': { content: <circle cx='4.5' cy='4.5' r='2' />, side: 9 },
  columns: { content: <path d='M3 0V6' strokeWidth='1.1' />, side: 6 },
  'cross-hatch': {
    content: <path d='M0 7L7 0M0 0L7 7' strokeWidth='0.8' />,
    side: 7
  },
  dots: { content: <circle cx='3' cy='3' r='1.1' />, side: 6 },
  hatch: {
    content: <path d='M0 6L6 0M-1 1L1 -1M5 7L7 5' strokeWidth='1' />,
    side: 6
  },
  lines: { content: <path d='M0 3H6' strokeWidth='1.1' />, side: 6 }
} as const satisfies Record<
  RegionPattern,
  { content: React.ReactNode; side: number }
>

/**
 * The printed page under the player's marks: region tints and patterns, thin
 * lines within a region, heavy ones between two, the outer frame — and the
 * pencil filter the marks are drawn through.
 */
export const RegionPrint: React.FC<{
  idPrefix: string
  puzzle: StarsPuzzle
}> = ({ idPrefix, puzzle }) => {
  const looks = useMemo(() => regionLooksOf(puzzle), [puzzle])
  const lines = useMemo(() => gridLinesOf(puzzle), [puzzle])
  const { regions, size } = puzzle
  const span = size * CELL_UNITS

  return (
    <>
      <defs>
        <filter
          filterUnits='userSpaceOnUse'
          height={span + 80}
          id={pencilFilterOf(idPrefix)}
          width={span + 80}
          x='-40'
          y='-40'
        >
          <feTurbulence
            baseFrequency='1.3'
            numOctaves={1}
            result='grain'
            seed={4}
            type='fractalNoise'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='grain'
            result='wobble'
            scale='1.6'
            xChannelSelector='R'
            yChannelSelector='G'
          />
          <feColorMatrix
            in='grain'
            result='mask'
            type='matrix'
            values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.3 0 0 0 1.45'
          />
          <feComposite in='wobble' in2='mask' operator='in' />
        </filter>
        {REGION_PATTERNS.map((pattern) => (
          <pattern
            className='region-pattern'
            height={PATTERN_TILES[pattern].side}
            id={patternIdOf({ idPrefix, pattern })}
            key={pattern}
            patternUnits='userSpaceOnUse'
            width={PATTERN_TILES[pattern].side}
          >
            {PATTERN_TILES[pattern].content}
          </pattern>
        ))}
      </defs>
      <g className='regions'>
        {cellsOf(size).map((cell) => {
          const look = looks[regions[cell] ?? 0]
          const x = columnOf({ cell, size }) * CELL_UNITS
          const y = rowOf({ cell, size }) * CELL_UNITS
          return (
            <g key={cell}>
              <rect
                className='region-tint'
                data-tint={look?.tint}
                height={CELL_UNITS}
                width={CELL_UNITS}
                x={x}
                y={y}
              />
              {look?.pattern != null && (
                <rect
                  fill={`url(#${patternIdOf({ idPrefix, pattern: look.pattern })})`}
                  height={CELL_UNITS}
                  width={CELL_UNITS}
                  x={x}
                  y={y}
                />
              )}
            </g>
          )
        })}
      </g>
      <path className='cell-lines' d={lines.thin} />
      <path className='region-lines' d={lines.heavy} />
      <rect className='frame' height={span} width={span} x='0' y='0' />
    </>
  )
}
