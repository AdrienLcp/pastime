import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import type { StarsMark, StarsMove } from '../engine/stars-state'
import {
  DOUBLE_TAP_MS,
  type PendingTap,
  pendingMoveOf,
  settledTap,
  tapCell
} from './cell-taps'

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
 * The board's input: a tap crosses a cell, a double tap or a long press stars
 * it, a drag crosses every cell it runs over — or rubs crosses out, when it
 * starts on one. A tap waiting for its possible second is shown at once
 * through `pendingMove`, and played once it settles. A click with no pointer
 * behind it (keyboard, screen reader) cycles the cell.
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
  const pendingTap = useRef<PendingTap | null>(null)
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pendingMove, setPendingMove] = useState<StarsMove | null>(null)
  const latestOnMove = useRef(onMove)
  useEffect(() => {
    latestOnMove.current = onMove
  }, [onMove])

  const holdTap = (pending: PendingTap | null) => {
    if (pendingTimer.current !== null) clearTimeout(pendingTimer.current)
    pendingTimer.current = null
    pendingTap.current = pending
    setPendingMove(pending === null ? null : pendingMoveOf(pending))
    if (pending !== null)
      pendingTimer.current = setTimeout(settle, DOUBLE_TAP_MS)
  }

  const settle = () => {
    const moves = settledTap(pendingTap.current)
    holdTap(null)
    for (const move of moves) latestOnMove.current(move)
  }

  useEffect(
    () => () => {
      for (const move of settledTap(pendingTap.current))
        latestOnMove.current(move)
      if (pendingTimer.current !== null) clearTimeout(pendingTimer.current)
    },
    []
  )

  const tap = (cell: number, at: number) => {
    const outcome = tapCell({ at, cell, pending: pendingTap.current })
    holdTap(outcome.pending)
    for (const move of outcome.moves) onMove(move)
  }

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
    if (pendingTap.current !== null && pendingTap.current.cell !== cell)
      settle()
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
      settle()
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
    if (current.drag === null) settle()
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
    else if (!current.isLong) tap(current.cell, event.timeStamp)
    release()
  }

  const onCellClick = (cell: number, event: React.MouseEvent) => {
    const isFromPointer = event.detail > 0
    if (isFromPointer) return
    settle()
    onMove({ cell, kind: 'cycle' })
  }

  return {
    cellAttribute: CELL_ATTRIBUTE,
    drag,
    onCellClick,
    pendingMove,
    surface: {
      onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
      onPointerCancel: release,
      onPointerDown,
      onPointerMove,
      onPointerUp
    }
  }
}
