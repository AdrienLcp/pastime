import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import {
  isDark,
  type LightsBoard,
  lightsEngine,
  pressLamp
} from './engine/lights-engine'
import { generateLights } from './generator/lights-generator'
import { solveLights } from './solver/lights-solver'

const board = (rows: string[]): LightsBoard => ({
  lit: rows
    .join('')
    .split('')
    .map((lamp) => lamp === '#'),
  size: rows.length
})

describe('lights', () => {
  it('[lights] flips the pressed lamp and its four neighbours, not the diagonals', () => {
    expect(pressLamp(board(['...', '...', '...']), 4)).toEqual(
      board(['.#.', '###', '.#.'])
    )
    expect(pressLamp(board(['...', '...', '...']), 0)).toEqual(
      board(['##.', '#..', '...'])
    )
  })

  it('[lights] refuses a press outside the board', () => {
    expect(
      lightsEngine.applyMove(board(['...', '...', '...']), { cell: 9 }).status
    ).toBe('failure')
  })

  it('[lights] solves a board in the fewest presses, which put it out', () => {
    const lit = [0, 4, 8].reduce(pressLamp, board(['...', '...', '...']))
    const presses = solveLights(lit)
    expect(presses).toHaveLength(3)
    expect(isDark((presses ?? []).reduce(pressLamp, lit))).toBe(true)
  })

  it('[lights] says when a 4×4 board has no way out', () => {
    expect(solveLights(board(['#...', '....', '....', '....']))).toBeNull()
  })

  it('[lights] hints a lamp that belongs to a shortest way out', () => {
    const lit = pressLamp(board(['...', '...', '...']), 4)
    expect(lightsEngine.hint(lit)).toEqual({ cell: 4 })
    expect(lightsEngine.hint(board(['...', '...', '...']))).toBeNull()
  })

  it('[lights] only prints levels the solver can put out', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (const variantId of ['3', '4']) {
        const level = generateLights({
          random: createSeededRandom(seed),
          variantId
        })
        if (level.status === 'failure') continue
        expect(isDark(level.data.level)).toBe(false)
        expect(solveLights(level.data.level)).not.toBeNull()
      }
    }
  })

  it('[lights] prints the same level from the same seed', () => {
    const draw = () =>
      generateLights({ random: createSeededRandom(12), variantId: '4' })
    expect(draw()).toEqual(draw())
  })
})
