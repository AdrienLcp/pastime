import type React from 'react'

import type { BoardProps } from '@/features/game-frame/game-module'
import { PencilLoop } from '@/features/game-frame/presentation/pencil-loop'
import { Button } from '@/presentation/components/button'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type {
  LightsBoard as LightsBoardState,
  LightsHint,
  LightsMove
} from '../engine/lights-engine'

import './lights-board.sass'

const lampsOf = (board: LightsBoardState) =>
  board.lit.map((isLit, cell) => ({ cell, isLit }))

/** A printed square of lamps; a lit one is inked in and drawn as a full disc. */
export const LightsBoard: React.FC<
  BoardProps<LightsBoardState, LightsMove, LightsHint>
> = ({ hint, isLocked, onMove, state }) => {
  const translate = useTranslate()
  const litCount = state.lit.filter(Boolean).length

  return (
    <div className='lights-board'>
      <fieldset
        aria-label={translate('games.lights.board', { size: state.size })}
        className='lamps'
        style={{ '--size': state.size }}
      >
        {lampsOf(state).map(({ cell, isLit }) => {
          const position = translate('games.lights.lamp', {
            column: (cell % state.size) + 1,
            row: Math.floor(cell / state.size) + 1
          })
          return (
            <Button
              aria-label={
                isLit
                  ? `${position}, ${translate('games.lights.lit')}`
                  : position
              }
              className='lamp'
              data-lit={isLit || undefined}
              isDisabled={isLocked}
              key={cell}
              onPress={() => onMove({ cell })}
            >
              <span aria-hidden='true' className='bulb' />
              {hint?.cell === cell && <PencilLoop />}
            </Button>
          )
        })}
      </fieldset>
      {!isLocked && (
        <p className='lit-count'>
          {translate('games.lights.litCount', {
            count: litCount,
            total: state.lit.length
          })}
        </p>
      )}
    </div>
  )
}
