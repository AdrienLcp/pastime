import { z } from 'zod/mini'

/**
 * How the games behave on this device. Sound and haptics start off: the app is
 * opened in the evening, beside someone asleep, and must never surprise. A
 * setting that fails to read falls back to off, never on.
 */
export const playSettingsSchema = z.object({
  haptics: z.catch(z.boolean(), false),
  sound: z.catch(z.boolean(), false)
})

export type PlaySettings = z.infer<typeof playSettingsSchema>

export const DEFAULT_PLAY_SETTINGS: PlaySettings = {
  haptics: false,
  sound: false
}
