import type React from 'react'

/** The chapter's mark: a ball above a fork, a ring and a ball below it. */
export const ColorDotsGlyph: React.FC = () => (
  <svg aria-hidden='true' viewBox='0 0 48 48'>
    <path
      d='M9 39L24 24L39 39M24 24V9'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
    />
    <circle cx='24' cy='9' fill='currentColor' r='6.5' />
    <circle
      cx='9'
      cy='39'
      fill='none'
      r='6'
      stroke='currentColor'
      strokeWidth='3'
    />
    <circle cx='39' cy='39' fill='currentColor' r='6.5' />
    <circle
      cx='24'
      cy='24'
      fill='none'
      r='5'
      stroke='currentColor'
      strokeWidth='3'
    />
  </svg>
)
