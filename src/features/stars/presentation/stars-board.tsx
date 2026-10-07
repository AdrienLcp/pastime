import type React from 'react'
import { useId, useMemo, useState } from 'react'

import type { BoardProps } from '@/features/game-frame/game-module'
import { usePlaySettings } from '@/features/settings/use-play-settings'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { conflictsOf, ruledOutCellsOf } from '../engine/stars-conflicts'
import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsHint } from '../engine/stars-hint'
import type { StarsMark, StarsMove, StarsState } from '../engine/stars-state'
import { PencilMarks } from './pencil-marks'
import { RegionPrint } from './region-print'
import { CELL_UNITS, cellsOf } from './stars-drawing'
import { useCellGestures } from './use-cell-gestures'

import './stars-board.sass'

/** The frame's line, outside the cells: half of it hangs past the grid. */
const FRAME_MARGIN = 3

const hintedCellsOf = (hint: StarsHint | null): readonly number[] => {
  if (hint === null) return []
  return hint.kind === 'step' ? hint.step.cells : [hint.cell]
}

const ARROW_STEPS = {
  ArrowDown: { columns: 0, rows: 1 },
  ArrowLeft: { columns: -1, rows: 0 },
  ArrowRight: { columns: 1, rows: 0 },
  ArrowUp: { columns: 0, rows: -1 }
} as const

const isArrow = (key: string): key is keyof typeof ARROW_STEPS =>
  key in ARROW_STEPS

/**
 * A Stars grid printed in the chapter's yellow, each region in its own tint
 * and pattern, the player's stars and crosses drawn over it in pencil. Cells
 * are buttons laid over the print: tap, long press, drag, or the keyboard.
 */
export const StarsBoard: React.FC<
  BoardProps<StarsState, StarsMove, StarsHint>
> = ({ hint, isLocked, onMove, state }) => {
  const translate = useTranslate()
  const { autoCross } = usePlaySettings()
  const idPrefix = `stars${useId().replace(/[^\w-]/g, '')}`
  const { level, marks } = state
  const { size } = level
  const gestures = useCellGestures({ marks, onMove })
  const [focusedCell, setFocusedCell] = useState(0)

  const conflicts = useMemo(() => conflictsOf(state), [state])
  const ruledOut = useMemo(
    () => (autoCross && !isLocked ? ruledOutCellsOf(state) : new Set<number>()),
    [autoCross, isLocked, state]
  )
  const shownMarks = useMemo(
    () =>
      marks.map((mark, cell): StarsMark => {
        const drag = gestures.drag
        return drag?.cells.has(cell) && mark !== 'star' ? drag.mark : mark
      }),
    [gestures.drag, marks]
  )

  const span = size * CELL_UNITS
  const starsPlaced = marks.filter((mark) => mark === 'star').length
  const [firstConflict] = conflicts

  const moveFocus = (event: React.KeyboardEvent<HTMLElement>, cell: number) => {
    if (!isArrow(event.key)) return
    event.preventDefault()
    const step = ARROW_STEPS[event.key]
    const row = Math.min(
      size - 1,
      Math.max(0, rowOf({ cell, size }) + step.rows)
    )
    const column = Math.min(
      size - 1,
      Math.max(0, columnOf({ cell, size }) + step.columns)
    )
    const next = row * size + column
    setFocusedCell(next)
    event.currentTarget.parentElement
      ?.querySelector<HTMLElement>(`[${gestures.cellAttribute}="${next}"]`)
      ?.focus()
  }

  const cellLabel = (cell: number) => {
    const position = translate('games.stars.cell', {
      column: columnOf({ cell, size }) + 1,
      region: (level.regions[cell] ?? 0) + 1,
      row: rowOf({ cell, size }) + 1
    })
    const mark = marks[cell]
    if (mark === 'star')
      return `${position}, ${translate('games.stars.marks.star')}`
    if (mark === 'cross')
      return `${position}, ${translate('games.stars.marks.cross')}`
    if (ruledOut.has(cell))
      return `${position}, ${translate('games.stars.marks.ruledOut')}`
    return position
  }

  return (
    <div className='stars-board' style={{ '--size': size }}>
      <div className='sheet'>
        <svg
          aria-hidden={!isLocked}
          aria-label={
            isLocked ? translate('games.stars.board', { size }) : undefined
          }
          className='print'
          role={isLocked ? 'img' : undefined}
          viewBox={`${-FRAME_MARGIN} ${-FRAME_MARGIN} ${span + 2 * FRAME_MARGIN} ${span + 2 * FRAME_MARGIN}`}
        >
          <RegionPrint idPrefix={idPrefix} puzzle={level} />
          <PencilMarks
            conflicts={conflicts}
            hinted={hintedCellsOf(hint)}
            idPrefix={idPrefix}
            marks={shownMarks}
            ruledOut={ruledOut}
            size={size}
          />
        </svg>
        {!isLocked && (
          <fieldset
            aria-label={translate('games.stars.board', { size })}
            className='cells'
            {...gestures.surface}
          >
            {cellsOf(size).map((cell) => (
              <button
                aria-label={cellLabel(cell)}
                className='cell'
                {...{ [gestures.cellAttribute]: cell }}
                key={cell}
                onClick={(event) => gestures.onCellClick(cell, event)}
                onFocus={() => setFocusedCell(cell)}
                onKeyDown={(event) => moveFocus(event, cell)}
                tabIndex={cell === focusedCell ? 0 : -1}
                type='button'
              />
            ))}
          </fieldset>
        )}
      </div>
      {!isLocked && (
        <>
          <p className='pencil-note' role='status'>
            {firstConflict !== undefined &&
              translate(`games.stars.conflicts.${firstConflict.kind}`)}
          </p>
          <p className='star-count'>
            {translate('games.stars.starCount', {
              count: starsPlaced,
              total: size * level.starsPerUnit
            })}
          </p>
        </>
      )}
    </div>
  )
}
