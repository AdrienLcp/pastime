/** A colour as CSS `oklch()` writes it: lightness 0–1, chroma, hue in degrees. */
export type Oklch = readonly [lightness: number, chroma: number, hue: number]

type Triple = readonly [number, number, number]
type Matrix = readonly [Triple, Triple, Triple]

/**
 * How each eye sees linear sRGB: typical vision, and the three kinds of full
 * colour blindness (Machado, Oliveira & Fernandes 2009, severity 1).
 */
export const VISIONS = {
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881]
  ],
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998]
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039]
  ],
  typical: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]
} as const satisfies Record<string, Matrix>

export type Vision = keyof typeof VISIONS

const multiply = (matrix: Matrix, [x, y, z]: Triple): Triple => {
  const [first, second, third] = matrix
  return [
    first[0] * x + first[1] * y + first[2] * z,
    second[0] * x + second[1] * y + second[2] * z,
    third[0] * x + third[1] * y + third[2] * z
  ]
}

const oklabOf = ([lightness, chroma, hue]: Oklch): Triple => {
  const angle = (hue * Math.PI) / 180
  return [lightness, chroma * Math.cos(angle), chroma * Math.sin(angle)]
}

const LAB_TO_LMS: Matrix = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548]
]
const LMS_TO_LINEAR_SRGB: Matrix = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701]
]
const LINEAR_SRGB_TO_LMS: Matrix = [
  [0.4122214708, 0.536301562, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005]
]
const LMS_TO_LAB: Matrix = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766]
]

const cube = ([x, y, z]: Triple): Triple => [x ** 3, y ** 3, z ** 3]
const cubeRoot = ([x, y, z]: Triple): Triple => [
  Math.cbrt(x),
  Math.cbrt(y),
  Math.cbrt(z)
]
const clamped = ([x, y, z]: Triple): Triple => [
  Math.min(1, Math.max(0, x)),
  Math.min(1, Math.max(0, y)),
  Math.min(1, Math.max(0, z))
]

/** The colour in linear sRGB, unclamped: a channel outside 0–1 is out of gamut. */
export const linearSrgbOf = (colour: Oklch): Triple =>
  multiply(LMS_TO_LINEAR_SRGB, cube(multiply(LAB_TO_LMS, oklabOf(colour))))

/** The colour as an eye with this vision sees it, back in OKLab. */
export const perceivedOf = (colour: Oklch, vision: Vision): Triple => {
  const seen = clamped(multiply(VISIONS[vision], clamped(linearSrgbOf(colour))))
  return multiply(LMS_TO_LAB, cubeRoot(multiply(LINEAR_SRGB_TO_LMS, seen)))
}

/** How far apart two colours look to an eye with this vision, in OKLab units. */
export const perceivedDistance = ({
  first,
  second,
  vision
}: {
  first: Oklch
  second: Oklch
  vision: Vision
}): number => {
  const [l1, a1, b1] = perceivedOf(first, vision)
  const [l2, a2, b2] = perceivedOf(second, vision)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

/** WCAG relative luminance, for contrast ratios. */
export const luminanceOf = (colour: Oklch): number => {
  const [red, green, blue] = clamped(linearSrgbOf(colour))
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
