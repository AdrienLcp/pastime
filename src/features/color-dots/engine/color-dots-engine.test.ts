import { describe, expect, it } from 'vitest'

import { colorDotsEngine } from './color-dots-engine'
import type { ColorDotsLevel, ColorDotsPiece } from './color-dots-level'
import { BALL_WIDTH } from './color-dots-ride'
import type { ColorDotsMove, ColorDotsState } from './color-dots-state'

const ball = (colour: number): ColorDotsPiece => ({ colour, kind: 'ball' })
const ring = (colour: number): ColorDotsPiece => ({ colour, kind: 'ring' })
const JOINT: ColorDotsPiece = { kind: 'joint' }

const levelOf = (
  nodes: readonly [ColorDotsPiece, number, number][],
  links: readonly [number, number][]
): ColorDotsLevel => ({
  links: links.map(([from, to]) => [from, to]),
  nodes: nodes.map(([piece, x, y]) => ({ piece, x, y }))
})

const play = (
  level: ColorDotsLevel,
  taps: readonly (number | ColorDotsMove)[]
) =>
  taps.reduce<ColorDotsState>((state, tap) => {
    const move = typeof tap === 'number' ? { ball: tap } : tap
    const played = colorDotsEngine.applyMove(state, move)
    if (played.status === 'failure') throw new Error(`tap ${move.ball} refused`)
    return played.data.board
  }, colorDotsEngine.start(level))

/**
 *  0 ─ 1 ─ 2 ─ 3      0, 4: balls of ink 0; 2, 3: rings of ink 0
 *      │
 *      4
 */
const CHAIN = levelOf(
  [
    [ball(0), 0, 0],
    [JOINT, 1, 0],
    [ring(0), 2, 0],
    [ring(0), 3, 0],
    [ball(0), 1, 1]
  ],
  [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4]
  ]
)

/**
 *  0 ─ 1 ─ 2      0: ball of ink 0, 2 its ring
 *      │          1: ring of ink 1, 3 its ball
 *      3
 */
const CROSSING = levelOf(
  [
    [ball(0), 0, 0],
    [ring(1), 1, 0],
    [ring(0), 2, 0],
    [ball(1), 1, 1]
  ],
  [
    [0, 1],
    [1, 2],
    [1, 3]
  ]
)

describe('colorDotsEngine', () => {
  it('[color-dots] fills a chain from its far end, and clears the lines left behind', () => {
    const first = play(CHAIN, [0])
    expect(first.rides).toEqual([
      {
        ball: 0,
        colour: 0,
        end: { kind: 'lands' },
        route: [0, 1, 2, 3],
        startMs: 0
      }
    ])
    expect(first.spots[3]).toEqual({ colour: 0, isFilled: true, kind: 'ring' })
    expect(first.spots[0]).toEqual({ kind: 'gone' })
    expect(first.spots[1]).toEqual({ kind: 'joint' })

    const done = play(CHAIN, [0, 4])
    expect(done.spots[2]).toEqual({ colour: 0, isFilled: true, kind: 'ring' })
    expect(done.spots[1]).toEqual({ kind: 'gone' })
    expect(colorDotsEngine.isWon(done)).toBe(true)
  })

  it('[color-dots] rides through an empty ring of another ink', () => {
    const state = play(CROSSING, [0, 3])
    expect(colorDotsEngine.isWon(state)).toBe(true)
  })

  it('[color-dots] pops a ball against a filled ring in the way, one ball short of it, and loses', () => {
    const state = play(CROSSING, [3, 0])
    const popped = state.rides.at(-1)
    expect(popped).toMatchObject({ ball: 0, route: [0, 1] })
    expect(popped?.end.kind === 'pops' && popped.end.steps).toBeCloseTo(
      1 - BALL_WIDTH
    )
    expect(colorDotsEngine.isLost?.(state)).toBe(true)
    expect(colorDotsEngine.isWon(state)).toBe(false)
    expect(colorDotsEngine.applyMove(state, { ball: 0 }).status).toBe('failure')
  })

  it('[color-dots] loses on a ball in the way', () => {
    const level = levelOf(
      [
        [ball(0), 0, 0],
        [ball(1), 1, 0],
        [ring(0), 2, 0],
        [ring(1), 1, 1]
      ],
      [
        [0, 1],
        [1, 2],
        [1, 3]
      ]
    )
    expect(play(level, [0]).rides.at(-1)).toMatchObject({
      end: { kind: 'pops' },
      route: [0, 1]
    })
    expect(colorDotsEngine.isWon(play(level, [1, 0]))).toBe(true)
  })

  it('[color-dots] enters the nearest chain of its ink, not the farthest ring', () => {
    const level = levelOf(
      [
        [ring(0), 0, 0],
        [ring(0), 1, 0],
        [ball(0), 2, 0],
        [JOINT, 3, 0],
        [ring(0), 5, 0],
        [ball(0), 3, 1],
        [ball(0), 3, 2]
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [3, 5],
        [5, 6]
      ]
    )
    expect(play(level, [2]).rides.at(-1)).toMatchObject({ route: [2, 1, 0] })
  })

  it('[color-dots] refuses a tap on anything but a ball', () => {
    const state = colorDotsEngine.start(CROSSING)
    expect(colorDotsEngine.applyMove(state, { ball: 1 }).status).toBe('failure')
  })

  it('[color-dots] hints the ball to send, or says an earlier tap sealed the board', () => {
    expect(colorDotsEngine.hint(colorDotsEngine.start(CROSSING))).toEqual({
      ball: 0,
      kind: 'next-ball'
    })
    const sealed = colorDotsEngine.applyMove(colorDotsEngine.start(CROSSING), {
      ball: 3
    })
    if (sealed.status === 'failure') throw new Error('tap refused')
    expect(colorDotsEngine.hint(sealed.data.board)).toEqual({
      kind: 'dead-end'
    })
  })

  describe('[color-dots] balls on their way together', () => {
    /**
     *  0 ─ 1 ───────── 2 ─ 3      4: ball of ink 0, 3 its ring
     *      │           │          5: ball of ink 1, 0 its ring
     *      4           5
     */
    const PASSING = levelOf(
      [
        [ring(1), 0, 0],
        [JOINT, 1, 0],
        [JOINT, 4, 0],
        [ring(0), 5, 0],
        [ball(0), 1, 1],
        [ball(1), 4, 1]
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 4],
        [2, 5]
      ]
    )

    it('[color-dots] pops the ball launched last when two meet head-on', () => {
      const state = play(PASSING, [4, { afterMs: 0, ball: 5 }])
      expect(state.rides.map((ride) => ride.end.kind)).toEqual([
        'lands',
        'pops'
      ])
      expect(colorDotsEngine.isLost?.(state)).toBe(true)
      expect(colorDotsEngine.isWon(state)).toBe(false)
    })

    it('[color-dots] lets the next ball go once the way is clear', () => {
      expect(
        colorDotsEngine.isWon(play(PASSING, [4, { afterMs: 400, ball: 5 }]))
      ).toBe(true)
      expect(colorDotsEngine.isWon(play(PASSING, [4, 5]))).toBe(true)
    })

    it('[color-dots] pops a ball that catches up with one still rolling past a joint', () => {
      const state = play(PASSING, [4, { afterMs: 200, ball: 5 }])
      expect(state.rides.at(-1)?.end.kind).toBe('pops')
    })

    /**
     *  0 ─ 1 ─ 2      0: ball of ink 1, 2 its ring
     *      │          1: ring of ink 0, 3 its ball, five steps down
     *      3
     */
    const CROSSING_FIRST = levelOf(
      [
        [ball(1), 0, 0],
        [ring(0), 1, 0],
        [ring(1), 2, 0],
        [ball(0), 1, 5]
      ],
      [
        [0, 1],
        [1, 2],
        [1, 3]
      ]
    )

    it('[color-dots] crosses an empty ring before the ball heading for it lands', () => {
      expect(
        colorDotsEngine.isWon(
          play(CROSSING_FIRST, [3, { afterMs: 0, ball: 0 }])
        )
      ).toBe(true)
      expect(colorDotsEngine.isLost?.(play(CROSSING_FIRST, [3, 0]))).toBe(true)
    })

    /**
     *  0 ─────── 1 ─ 2      0: ball of ink 0, 2 its ring
     *            │          1: ring of ink 1, 3 its ball
     *            3
     */
    const LANDING_IN_THE_WAY = levelOf(
      [
        [ball(0), 0, 0],
        [ring(1), 3, 0],
        [ring(0), 4, 0],
        [ball(1), 3, 1]
      ],
      [
        [0, 1],
        [1, 2],
        [1, 3]
      ]
    )

    it('[color-dots] pops a rolling ball that runs into one landed on its way, and empties its ring', () => {
      const state = play(LANDING_IN_THE_WAY, [0, { afterMs: 0, ball: 3 }])
      const [first, second] = state.rides
      expect(second?.end.kind).toBe('lands')
      expect(first?.end.kind === 'pops' && first.end.steps).toBeCloseTo(
        3 - BALL_WIDTH,
        1
      )
      expect(state.spots[2]).toEqual({
        colour: 0,
        isFilled: false,
        kind: 'ring'
      })
      expect(colorDotsEngine.isLost?.(state)).toBe(true)
      expect(colorDotsEngine.isWon(play(LANDING_IN_THE_WAY, [0, 3]))).toBe(true)
    })

    it('[color-dots] takes a ring the moment its ball leaves', () => {
      const state = play(CHAIN, [0, { afterMs: 100, ball: 4 }])
      expect(state.rides.map(({ end, route }) => ({ end, route }))).toEqual([
        { end: { kind: 'lands' }, route: [0, 1, 2, 3] },
        { end: { kind: 'lands' }, route: [4, 1, 2] }
      ])
      expect(colorDotsEngine.isWon(state)).toBe(true)
    })
  })
})
