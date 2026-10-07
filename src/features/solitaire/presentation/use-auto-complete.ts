import { useEffect, useState } from 'react'

import {
  autoCompleteMoveOf,
  canAutoComplete
} from '../engine/solitaire-auto-complete'
import type { SolitaireMove, SolitaireState } from '../engine/solitaire-state'

/** The pace cards fly home once the player asks the game to finish itself. */
const STEP_MS = 130

/**
 * Once nothing is left to decide, the player can ask for the rest: every
 * card then goes home one by one, each a move of its own, so undo still works.
 */
export const useAutoComplete = ({
  onMove,
  state
}: {
  state: SolitaireState
  onMove: (move: SolitaireMove) => void
}) => {
  const [isFinishing, setFinishing] = useState(false)
  const next = isFinishing ? autoCompleteMoveOf(state) : null

  useEffect(() => {
    if (next === null) return
    const timer = setTimeout(() => onMove(next), STEP_MS)
    return () => clearTimeout(timer)
  }, [next, onMove])

  return {
    canFinish: !isFinishing && canAutoComplete(state),
    finish: () => setFinishing(true)
  }
}
