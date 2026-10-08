import { z } from 'zod/mini'

/**
 * What the page asks a generator's worker for: one level, from one seed. The
 * puzzle's number lets a numbered progression set the level's difficulty.
 */
export const generatorRequestSchema = z.object({
  number: z.number(),
  seed: z.number(),
  variantId: z.string()
})

export type GeneratorRequest = z.infer<typeof generatorRequestSchema>

/**
 * `'gave_up'` when this seed led nowhere within the generator's own budget:
 * the page then tries a derived seed.
 */
export type GeneratorResponse =
  | { readonly status: 'success'; readonly level: unknown }
  | { readonly status: 'failure'; readonly error: 'gave_up' }

export const generatorResponseSchema = z.discriminatedUnion('status', [
  z.object({ level: z.unknown(), status: z.literal('success') }),
  z.object({ error: z.literal('gave_up'), status: z.literal('failure') })
])
