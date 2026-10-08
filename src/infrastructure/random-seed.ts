/** A fresh 32-bit seed for a level never played before. */
export const randomSeed = (): number => {
  const [seed = 0] = crypto.getRandomValues(new Uint32Array(1))
  return seed
}
