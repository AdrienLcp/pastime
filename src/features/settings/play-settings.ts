import { z } from 'zod/mini'

/**
 * How the games behave on this device. Sound and haptics start off: the app is
 * opened in the evening, beside someone asleep, and must never surprise. A
 * sound or haptics setting that fails to read falls back to off, never on.
 * Auto-cross is a help, on until the player turns it off.
 */
export const playSettingsSchema = z.object({
  autoCross: z.catch(z.boolean(), true),
  haptics: z.catch(z.boolean(), false),
  sound: z.catch(z.boolean(), false)
})

export type PlaySettings = z.infer<typeof playSettingsSchema>

export const DEFAULT_PLAY_SETTINGS: PlaySettings = {
  autoCross: true,
  haptics: false,
  sound: false
}
