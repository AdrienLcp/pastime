export { reloadPage } from '@adrienlcp/browser'

/** Whether this browser can run the app's service worker at all. */
export const hasServiceWorker = (): boolean => 'serviceWorker' in navigator

/** The languages the browser says the player reads, most preferred first. */
export const preferredLocales = (): readonly string[] => navigator.languages

/** Opened from the home screen or an app window, rather than in a browser tab. */
export const isStandaloneDisplay = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && navigator.standalone === true)
