import type React from 'react'

/** The chapter's mark: three lamps of a printed square, one still lit. */
export const LightsGlyph: React.FC = () => (
  <svg
    aria-hidden='true'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    viewBox='0 0 48 48'
  >
    <rect height='36' width='36' x='6' y='6' />
    <path d='M18 6v36M30 6v36M6 18h36M6 30h36' strokeWidth='1.5' />
    <circle cx='24' cy='24' fill='currentColor' r='4.5' />
    <circle cx='12' cy='12' r='3.5' />
    <circle cx='36' cy='36' r='3.5' />
  </svg>
)
