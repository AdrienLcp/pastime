import { useRef } from 'react'

const QUARTER = 90

type Spins = {
  readonly turns: readonly number[]
  readonly degrees: readonly number[]
}

/**
 * How far each tile is drawn turned, in degrees, counted on from the last
 * render rather than from the dealt tile: three quarters back plays as one
 * quarter anticlockwise, and 270° → 0° never spins the long way round.
 */
export const useTileSpins = (turns: readonly number[]): readonly number[] => {
  const spins = useRef<Spins | null>(null)
  const previous = spins.current
  if (previous === null || previous.turns.length !== turns.length)
    spins.current = { degrees: turns.map((turn) => turn * QUARTER), turns }
  else if (previous.turns !== turns)
    spins.current = {
      degrees: previous.degrees.map((degrees, cell) => {
        const step = ((turns[cell] ?? 0) - (previous.turns[cell] ?? 0) + 4) % 4
        return degrees + (step === 3 ? -QUARTER : step * QUARTER)
      }),
      turns
    }
  return spins.current?.degrees ?? []
}
