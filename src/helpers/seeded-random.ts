/**
 * The app's only source of randomness for puzzles: the same seed draws the
 * same sequence on every device, which is what makes a level reproducible from
 * its share code and the daily puzzle the same for everyone.
 *
 * sfc32, seeded through a 32-bit string hash: a few lines, fast, and good
 * enough for shuffling and level generation. Nothing here is for secrets.
 */
export type SeededRandom = {
  /** A float in `[0, 1)`. */
  readonly next: () => number
  /** An integer in `[0, bound)`. */
  readonly below: (bound: number) => number
  /** One element of a non-empty list. */
  readonly pick: <T>(items: readonly [T, ...T[]]) => T
  /** A shuffled copy; the input is left untouched. */
  readonly shuffled: <T>(items: readonly T[]) => T[]
}

const UINT32 = 2 ** 32

/** cyrb53's mixing, folded to 32 bits: any text to a well-spread seed. */
export const seedFromText = (text: string): number => {
  let first = 0xdeadbeef
  let second = 0x41c6ce57
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0
    first = Math.imul(first ^ code, 2654435761)
    second = Math.imul(second ^ code, 1597334677)
  }
  first =
    Math.imul(first ^ (first >>> 16), 2246822507) ^
    Math.imul(second ^ (second >>> 13), 3266489909)
  second =
    Math.imul(second ^ (second >>> 16), 2246822507) ^
    Math.imul(first ^ (first >>> 13), 3266489909)
  return (second ^ first) >>> 0
}

export const createSeededRandom = (seed: number): SeededRandom => {
  let a = 0x9e3779b9
  let b = 0x243f6a88
  let c = 0xb7e15162
  let d = seed >>> 0

  const nextUint32 = (): number => {
    const t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return t >>> 0
  }

  // The first draws still echo the seed's bits: thrown away.
  for (let warmUp = 0; warmUp < 15; warmUp++) nextUint32()

  const next = (): number => nextUint32() / UINT32
  const below = (bound: number): number => Math.floor(next() * bound)

  return {
    below,
    next,
    pick: (items) => items[below(items.length)] ?? items[0],
    shuffled: (items) => {
      const copy = [...items]
      for (let index = copy.length - 1; index > 0; index--) {
        const swapWith = below(index + 1)
        const current = copy[index]
        const other = copy[swapWith]
        if (current === undefined || other === undefined) continue
        copy[index] = other
        copy[swapWith] = current
      }
      return copy
    }
  }
}
