import type React from 'react'
import { useRef, useState } from 'react'

import type { Lift } from './table-layout'

/** A press that travels further than this is a drag, not a tap. */
const DRAG_THRESHOLD_PX = 6

export type DragOffset = { readonly dx: number; readonly dy: number }

/** The stack in the player's hand and how far it has travelled. */
export type Drag = DragOffset & { readonly lift: Lift }

type Press = {
  readonly pointerId: number
  readonly lift: Lift
  readonly startX: number
  readonly startY: number
  readonly isDragging: boolean
}

const offsetOf = (press: Press, event: React.PointerEvent): DragOffset => ({
  dx: event.clientX - press.startX,
  dy: event.clientY - press.startY
})

/**
 * A card's pointer handlers: pressed and let go where it was, it is a tap;
 * carried, the stack follows the finger and is dropped where it is let go.
 */
export const useCardDrag = ({
  onDrop,
  onTap
}: {
  onTap: (lift: Lift) => void
  onDrop: (drag: Drag) => void
}) => {
  const press = useRef<Press | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)

  const release = () => {
    press.current = null
    setDrag(null)
  }

  const cardProps = (lift: Lift) => ({
    onPointerCancel: release,
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (!event.isPrimary || event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      press.current = {
        isDragging: false,
        lift,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY
      }
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const current = press.current
      if (current === null || current.pointerId !== event.pointerId) return
      const offset = offsetOf(current, event)
      if (
        !current.isDragging &&
        Math.hypot(offset.dx, offset.dy) < DRAG_THRESHOLD_PX
      )
        return
      press.current = { ...current, isDragging: true }
      setDrag({ ...offset, lift: current.lift })
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const current = press.current
      if (current === null || current.pointerId !== event.pointerId) return
      if (current.isDragging)
        onDrop({ ...offsetOf(current, event), lift: current.lift })
      else onTap(current.lift)
      release()
    }
  })

  return { cardProps, drag }
}
