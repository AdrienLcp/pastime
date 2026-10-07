import { createThemePreferenceStore } from '@adrienlcp/theme-preference'

/**
 * The day book, the night book, or whichever the device is in. Shared by the
 * theme switch and by the Vite plugin that inlines the pre-paint script, so
 * both read the same key. No `@/` import, so `vite.config.ts` can load it.
 */
export const themeStore = createThemePreferenceStore({
  storageKey: 'pastime.theme'
})
