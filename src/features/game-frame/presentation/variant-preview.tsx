import type React from 'react'

import { BlankGrid } from './blank-grid'

import './variant-preview.sass'

/** A size picked before it is dealt: its empty grid where the board stands. */
export const VariantPreview: React.FC<{ gridSize: number }> = ({
  gridSize
}) => (
  <div aria-hidden='true' className='variant-preview' data-fills-height>
    <BlankGrid size={gridSize} />
  </div>
)
