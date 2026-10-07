/**
 * Safari ships no `Temporal` yet. Where the browser has its own, nothing is
 * downloaded; elsewhere the polyfill is fetched before the app starts.
 */
if (!('Temporal' in globalThis)) {
  await import('temporal-polyfill/global')
}

export {}
