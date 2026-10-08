import { describe, expect, it } from 'vitest'

import { colorDotsEngine } from './color-dots-engine'
import type { ColorDotsLevel, ColorDotsPiece } from './color-dots-level'
import type { ColorDotsState } from './color-dots-state'

const ball = (colour: number): ColorDotsPiece => ({ colour, kind: 'ball' })
const ring = (colour: number): ColorDotsPiece => ({ colour, kind: 'ring' })
const JOINT: ColorDotsPiece = { kind: 'joint' }

const levelOf = (
  nodes: readonly [ColorDotsPiece, number, number][],
  links: readonly [number, number][]
): ColorDotsLevel => ({
  boss: false,
  links: links.map(([from, to]) => [from, to]),
  nodes: nodes.map(([piece, x, y]) => ({ piece, x, y }))
})

const play = (level: ColorDotsLevel, balls: readonly number[]) =>
  balls.reduce<ColorDotsState>((state, next) => {
    const played = colorDotsEngine.applyMove(state, { ball: next })
    if (played.status === 'failure') throw new Error(`tap ${next} refused`)
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
    expect(first.lastTap).toEqual({
      ball: 0,
      colour: 0,
      kind: 'arrived',
      route: [0, 1, 2, 3]
    })
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

  it('[color-dots] loses on a filled ring in the way, stopping one node short', () => {
    const state = play(CROSSING, [3, 0])
    expect(state.lastTap).toEqual({
      ball: 0,
      blocker: 1,
      colour: 0,
      kind: 'blocked',
      route: [0]
    })
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
    expect(play(level, [0]).lastTap).toMatchObject({
      blocker: 1,
      kind: 'blocked'
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
    expect(play(level, [2]).lastTap).toMatchObject({ route: [2, 1, 0] })
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
})
