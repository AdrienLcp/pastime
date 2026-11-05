import { useState } from 'react'

const QUARTER = 90

type Spins = {
  readonly turns: readonly number[]
  readonly degrees: readonly number[]
}

const dealtSpinsOf = (turns: readonly number[]): Spins => ({
  degrees: turns.map((turn) => turn * QUARTER),
  turns
})

const spinsAfter = (previous: Spins, turns: readonly number[]): Spins =>
  previous.turns.length === turns.length
    ? {
        degrees: previous.degrees.map((degrees, cell) => {
          const step =
            ((turns[cell] ?? 0) - (previous.turns[cell] ?? 0) + 4) % 4
          return degrees + (step === 3 ? -QUARTER : step * QUARTER)
        }),
        turns
      }
    : dealtSpinsOf(turns)

/**
 * How far each tile is drawn turned, in degrees, counted on from the last
 * render rather than from the dealt tile: three quarters back plays as one
 * quarter anticlockwise, and 270° → 0° never spins the long way round.
 */
export const useTileSpins = (turns: readonly number[]): readonly number[] => {
  const [spins, setSpins] = useState(() => dealtSpinsOf(turns))
  if (spins.turns === turns) return spins.degrees
  const next = spinsAfter(spins, turns)
  setSpins(next)
  return next.degrees
}
