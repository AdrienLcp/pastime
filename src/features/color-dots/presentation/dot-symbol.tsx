import type React from 'react'

import type { DotSymbol } from './color-dots-inks'

/** Each symbol fits a 10-unit box around the node's centre. */
const SYMBOL_PATHS = {
  cross: 'M-1.6 -5H1.6V-1.6H5V1.6H1.6V5H-1.6V1.6H-5V-1.6H-1.6Z',
  diamond: 'M0 -5.2L5.2 0L0 5.2L-5.2 0Z',
  dot: 'M0 -3.6A3.6 3.6 0 1 1 0 3.6A3.6 3.6 0 1 1 0 -3.6Z',
  square: 'M-3.8 -3.8H3.8V3.8H-3.8Z',
  triangle: 'M0 -5L5 4H-5Z'
} as const satisfies Record<DotSymbol, string>

/**
 * The shape a colour wears on its balls and rings, so that no two colours are
 * told apart by ink alone.
 */
export const DotSymbolMark: React.FC<{
  symbol: DotSymbol
  scale?: number
  className: string
}> = ({ className, scale = 1, symbol }) => (
  <path
    className={className}
    d={SYMBOL_PATHS[symbol]}
    transform={scale === 1 ? undefined : `scale(${scale})`}
  />
)
