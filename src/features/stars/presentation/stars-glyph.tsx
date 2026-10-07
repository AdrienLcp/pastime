import type React from 'react'

/** The chapter's mark: a corner of a printed grid, one region walled off, a star and a cross. */
export const StarsGlyph: React.FC = () => (
  <svg aria-hidden='true' viewBox='0 0 48 48'>
    <path
      d='M24 6V42M6 24H42'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
    />
    <path d='M6 24H24V42' fill='none' stroke='currentColor' strokeWidth='4' />
    <rect
      fill='none'
      height='36'
      stroke='currentColor'
      strokeWidth='4'
      width='36'
      x='6'
      y='6'
    />
    <polygon
      fill='currentColor'
      points='33,8.5 34.7,13.2 39.7,13.3 35.8,16.4 37.1,21.2 33,18.4 28.9,21.2 30.2,16.4 26.3,13.3 31.3,13.2'
    />
    <path
      d='M10.5 28.5l6 6M16.5 28.5l-6 6'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth='1.8'
    />
  </svg>
)
