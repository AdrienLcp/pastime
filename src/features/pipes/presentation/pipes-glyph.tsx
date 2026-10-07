import type React from 'react'
import { useId } from 'react'

const PIPE = 'M8 24H24V4M24 24V44'

/**
 * The chapter's mark: a dead end feeding a T, its channel cut out of the ink
 * so it shows whatever the glyph is printed on.
 */
export const PipesGlyph: React.FC = () => {
  const channel = `pipes-channel${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg aria-hidden='true' viewBox='0 0 48 48'>
      <mask id={channel}>
        <rect fill='white' height='48' width='48' />
        <path d={PIPE} fill='none' stroke='black' strokeWidth='5.5' />
        <circle cx='8' cy='24' fill='black' r='4' />
      </mask>
      <g fill='currentColor' mask={`url(#${channel})`}>
        <path d={PIPE} fill='none' stroke='currentColor' strokeWidth='13' />
        <circle cx='8' cy='24' r='8' />
      </g>
    </svg>
  )
}
