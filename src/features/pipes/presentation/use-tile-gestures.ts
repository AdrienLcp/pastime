import type React from 'react'
import { useRef } from 'react'

import type { PipesMove } from '../engine/pipes-state'

/** Held this long, a press locks the tile instead of turning it. */
const LONG_PRESS_MS = 420

export type TurnDirection = 'clockwise' | 'back'

const QUARTER_TURNS = { back: 3, clockwise: 1 } as const satisfies Record<
  TurnDirection,
  1 | 3
>

const OTHER_WAY = {
  back: 'clockwise',
  clockwise: 'back'
} as const satisfies Record<TurnDirection, TurnDirection>

type Press = {
  readonly pointerId: number
  readonly cell: number
  readonly isLong: boolean
}

/**
 * A tile's buttons: a tap turns it the chosen way, a long press locks it, a
 * right click turns it the other way. A click with no pointer behind it
 * (keyboard, screen reader) is a tap; `L` locks.
 */
export const useTileGestures = ({
  direction,
  onMove
}: {
  direction: TurnDirection
  onMove: (move: PipesMove) => void
}) => {
  const press = useRef<Press | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const turn = (cell: number, way: TurnDirection) =>
    onMove({ cell, kind: 'turn', quarterTurns: QUARTER_TURNS[way] })

  const release = () => {
    if (longPressTimer.current !== null) clearTimeout(longPressTimer.current)
    longPressTimer.current = null
    press.current = null
  }

  const tileProps = (cell: number) => ({
    onClick: (event: React.MouseEvent) => {
      const isFromPointer = event.detail > 0
      if (!isFromPointer) turn(cell, direction)
    },
    onContextMenu: (event: React.MouseEvent) => {
      event.preventDefault()
      if (press.current === null) turn(cell, OTHER_WAY[direction])
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'l') return
      event.preventDefault()
      onMove({ cell, kind: 'lock' })
    },
    onPointerCancel: release,
    onPointerDown: (event: React.PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      release()
      press.current = { cell, isLong: false, pointerId: event.pointerId }
      longPressTimer.current = setTimeout(() => {
        if (press.current?.cell !== cell) return
        press.current = { ...press.current, isLong: true }
        onMove({ cell, kind: 'lock' })
      }, LONG_PRESS_MS)
    },
    onPointerLeave: release,
    onPointerUp: (event: React.PointerEvent) => {
      const current = press.current
      if (current === null || current.pointerId !== event.pointerId) return
      if (!current.isLong) turn(cell, direction)
      release()
    }
  })

  return { tileProps }
}

export const otherWayOf = (direction: TurnDirection): TurnDirection =>
  OTHER_WAY[direction]
