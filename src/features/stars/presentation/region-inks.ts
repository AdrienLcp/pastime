import { type Oklch, perceivedDistance, VISIONS } from './colour-vision'

/** One region ink: a flat tint for the day book, and its shade under the lamp. */
export type RegionInk = {
  readonly name: string
  readonly day: Oklch
  readonly night: Oklch
}

/**
 * Twelve flat inks, as many as the largest grid has regions. Lightness, not
 * only hue, sets them apart, so they stay distinct to every colour vision:
 * light tints under dark marks by day, deep shades under light marks at night.
 */
export const REGION_INKS = [
  { day: [0.95, 0.112, 108], name: 'yellow', night: [0.58, 0.081, 92] },
  { day: [0.79, 0.157, 74], name: 'orange', night: [0.4, 0.089, 49] },
  { day: [0.71, 0.149, 39], name: 'coral', night: [0.33, 0.074, 31] },
  { day: [0.83, 0.042, 352], name: 'pink', night: [0.51, 0.13, 346] },
  { day: [0.68, 0.104, 320], name: 'plum', night: [0.33, 0.052, 318] },
  { day: [0.79, 0.097, 297], name: 'violet', night: [0.42, 0.111, 295] },
  { day: [0.68, 0.138, 260], name: 'blue', night: [0.34, 0.106, 273] },
  { day: [0.87, 0.078, 230], name: 'sky', night: [0.5, 0.101, 241] },
  { day: [0.73, 0.06, 187], name: 'teal', night: [0.4, 0.049, 185] },
  { day: [0.94, 0.071, 170], name: 'mint', night: [0.58, 0.074, 170] },
  { day: [0.79, 0.133, 153], name: 'green', night: [0.46, 0.061, 147] },
  { day: [0.86, 0.13, 121], name: 'lime', night: [0.5, 0.1, 111] }
] as const satisfies readonly RegionInk[]

const oklchCss = ([lightness, chroma, hue]: Oklch) =>
  `oklch(${Math.round(lightness * 1000) / 10}% ${chroma} ${hue})`

/** The ink as a CSS colour that follows the book's day or night. */
export const regionInkCss = ({ day, night }: RegionInk) =>
  `light-dark(${oklchCss(day)}, ${oklchCss(night)})`

const VISION_NAMES = Object.keys(VISIONS).filter(
  (vision): vision is keyof typeof VISIONS => vision in VISIONS
)

/** How far apart two inks look to the eye that confuses them most, by day or night. */
export const inkDistance = (first: RegionInk, second: RegionInk): number =>
  Math.min(
    ...VISION_NAMES.flatMap((vision) => [
      perceivedDistance({ first: first.day, second: second.day, vision }),
      perceivedDistance({ first: first.night, second: second.night, vision })
    ])
  )
