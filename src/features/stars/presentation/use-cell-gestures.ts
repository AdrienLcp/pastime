import type React from 'react'
import { useRef, useState } from 'react'

import type { StarsMark, StarsMove } from '../engine/stars-state'

/** Held this long without moving, a press sets a star at once. */
const LONG_PRESS_MS = 420

/** A drag in progress: the cells it ran over, and what it writes in them. */
export type DragMarks = {
  readonly cells: ReadonlySet<number>
  readonly mark: 'cross' | 'blank'
}

type Press = {
  readonly pointerId: number
  readonly cell: number
  readonly isLong: boolean
  readonly drag: DragMarks | null
}

const CELL_ATTRIBUTE = 'data-cell'

const cellAt = (x: number, y: number): number | null => {
  const cell = document
    .elementFromPoint(x, y)
    ?.closest(`[${CELL_ATTRIBUTE}]`)
    ?.getAttribute(CELL_ATTRIBUTE)
  return cell === null || cell === undefined ? null : Number(cell)
}

/**
 * The board's pencil: a tap cycles a cell, a long press stars it, a drag
 * crosses every cell it runs over — or rubs crosses out, when it starts on one.
 * A click with no pointer behind it (keyboard, screen reader) is a tap.
 */
export const useCellGestures = ({
  marks,
  onMove
}: {
  marks: readonly StarsMark[]
  onMove: (move: StarsMove) => void
}) => {
  const press = useRef<Press | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [drag, setDrag] = useState<DragMarks | null>(null)

  const stopLongPress = () => {
    if (longPressTimer.current !== null) clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  const release = () => {
    stopLongPress()
    press.current = null
    setDrag(null)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!event.isPrimary || event.button !== 0) return
    const cell = cellAt(event.clientX, event.clientY)
    if (cell === null) return
    event.currentTarget.setPointerCapture(event.pointerId)
    press.current = {
      cell,
      drag: null,
      isLong: false,
      pointerId: event.pointerId
    }
    stopLongPress()
    longPressTimer.current = setTimeout(() => {
      if (press.current === null || press.current.drag !== null) return
      press.current = { ...press.current, isLong: true }
      onMove({ cell, kind: 'star' })
    }, LONG_PRESS_MS)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const current = press.current
    if (current === null || current.pointerId !== event.pointerId) return
    if (current.isLong) return
    const cell = cellAt(event.clientX, event.clientY)
    if (cell === null) return
    if (current.drag === null && cell === current.cell) return
    stopLongPress()
    const started = current.drag ?? {
      cells: new Set([current.cell]),
      mark:
        marks[current.cell] === 'cross'
          ? ('blank' as const)
          : ('cross' as const)
    }
    if (started.cells.has(cell) && current.drag !== null) return
    const next = { ...started, cells: new Set([...started.cells, cell]) }
    press.current = { ...current, drag: next }
    setDrag(next)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const current = press.current
    if (current === null || current.pointerId !== event.pointerId) return
    if (current.drag !== null)
      onMove({
        cells: [...current.drag.cells],
        kind: 'mark',
        mark: current.drag.mark
      })
    else if (!current.isLong) onMove({ cell: current.cell, kind: 'cycle' })
    release()
  }

  const onCellClick = (cell: number, event: React.MouseEvent) => {
    const isFromPointer = event.detail > 0
    if (!isFromPointer) onMove({ cell, kind: 'cycle' })
  }

  return {
    cellAttribute: CELL_ATTRIBUTE,
    drag,
    onCellClick,
    surface: {
      onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
      onPointerCancel: release,
      onPointerDown,
      onPointerMove,
      onPointerUp
    }
  }
}
