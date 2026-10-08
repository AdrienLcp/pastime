import type React from 'react'

const CELL = 40
const MARGIN = 3

/** An empty grid of this side, printed as a level's grid is: what a size looks like before it is dealt. */
export const BlankGrid: React.FC<{ size: number }> = ({ size }) => {
  const side = size * CELL + 2 * MARGIN
  const lines = Array.from({ length: size - 1 }, (_, index) => {
    const at = MARGIN + (index + 1) * CELL
    return `M${at} ${MARGIN}V${side - MARGIN}M${MARGIN} ${at}H${side - MARGIN}`
  }).join('')

  return (
    <svg
      aria-hidden='true'
      className='blank-grid'
      viewBox={`0 0 ${side} ${side}`}
    >
      <path className='blank-grid-lines' d={lines} />
      <rect
        className='blank-grid-frame'
        height={side - 2 * MARGIN}
        width={side - 2 * MARGIN}
        x={MARGIN}
        y={MARGIN}
      />
    </svg>
  )
}
