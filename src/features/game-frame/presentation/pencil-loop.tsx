import type React from 'react'

import './pencil-loop.sass'

/**
 * A ring drawn by hand around whatever holds it: the frame's way of pointing
 * at a cell. The stroke overshoots where it closes, as a pencil does.
 */
export const PencilLoop: React.FC = () => (
  <svg
    aria-hidden='true'
    className='pencil-loop'
    preserveAspectRatio='none'
    viewBox='0 0 100 100'
  >
    <path
      d='M58 9C82 10 95 27 93 50C91 74 72 92 48 91C25 90 7 73 8 49C9 27 26 10 50 8C60 7 71 10 78 15'
      pathLength='1'
      vectorEffect='non-scaling-stroke'
    />
  </svg>
)
