import { describe, expect, it } from 'vitest'

import {
  linearSrgbOf,
  luminanceOf,
  type Oklch,
  perceivedDistance
} from './colour-vision'
import { inkDistance, REGION_INKS, regionInkCss } from './region-inks'

/** Two flat inks closer than this, for some eye, start to read as one. */
const LEAST_INK_DISTANCE = 0.06

/** WCAG 1.4.11: a mark against the fill under it. */
const LEAST_MARK_CONTRAST = 3

const MARK_INK = { day: [0.2, 0.012, 260], night: [0.92, 0.014, 95] } as const

const contrastOf = (first: Oklch, second: Oklch) => {
  const [lighter, darker] = [luminanceOf(first), luminanceOf(second)].toSorted(
    (a, b) => b - a
  )
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}

const pairs = REGION_INKS.flatMap((first, index) =>
  REGION_INKS.slice(index + 1).map((second) => [first, second] as const)
)

describe('region inks', () => {
  it('[stars] prints at least as many inks as the largest grid has regions', () => {
    expect(REGION_INKS.length).toBeGreaterThanOrEqual(12)
  })

  it('[stars] keeps every pair of inks apart for every colour vision, day and night', () => {
    for (const [first, second] of pairs)
      expect(
        inkDistance(first, second),
        `${first.name} / ${second.name}`
      ).toBeGreaterThanOrEqual(LEAST_INK_DISTANCE)
  })

  it('[stars] sees protanopia confuse red and green that typical vision tells apart', () => {
    const red: Oklch = [0.6, 0.15, 30]
    const green: Oklch = [0.6, 0.12, 130]
    const typical = perceivedDistance({
      first: red,
      second: green,
      vision: 'typical'
    })
    const protanopia = perceivedDistance({
      first: red,
      second: green,
      vision: 'protanopia'
    })
    expect(protanopia).toBeLessThan(typical / 2)
  })

  it('[stars] leaves stars and crosses readable on every ink', () => {
    for (const ink of REGION_INKS) {
      expect(
        contrastOf(ink.day, MARK_INK.day),
        ink.name
      ).toBeGreaterThanOrEqual(LEAST_MARK_CONTRAST)
      expect(
        contrastOf(ink.night, MARK_INK.night),
        ink.name
      ).toBeGreaterThanOrEqual(LEAST_MARK_CONTRAST)
    }
  })

  it('[stars] stays inside the sRGB gamut', () => {
    for (const ink of REGION_INKS)
      for (const colour of [ink.day, ink.night])
        for (const channel of linearSrgbOf(colour)) {
          expect(channel, ink.name).toBeGreaterThanOrEqual(-0.001)
          expect(channel, ink.name).toBeLessThanOrEqual(1.001)
        }
  })

  it('[stars] writes an ink as a colour for both books', () => {
    expect(
      regionInkCss({
        day: [0.95, 0.112, 108],
        name: 'yellow',
        night: [0.58, 0.081, 92]
      })
    ).toBe('light-dark(oklch(95% 0.112 108), oklch(58% 0.081 92))')
  })
})
