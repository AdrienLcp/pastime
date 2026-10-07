import type { ManifestOptions } from 'vite-plugin-pwa'

/**
 * What the browser installs. The colours are the dark ground `index.html`
 * announces: the splash screen and the title bar a phone paints before the
 * first frame. No `@/` import, so `vite.config.ts` can load it.
 */
export const webAppManifest: Partial<ManifestOptions> = {
  background_color: '#121212',
  categories: ['games', 'entertainment'],
  description:
    'Small solo puzzle and card games in one app: no ads, no account, works offline.',
  display: 'standalone',
  icons: [
    {
      purpose: 'any',
      sizes: '192x192',
      src: '/icons/icon-192.png',
      type: 'image/png'
    },
    {
      purpose: 'any',
      sizes: '512x512',
      src: '/icons/icon-512.png',
      type: 'image/png'
    },
    {
      purpose: 'maskable',
      sizes: '512x512',
      src: '/icons/icon-maskable-512.png',
      type: 'image/png'
    }
  ],
  id: '/',
  lang: 'fr',
  name: 'Pastime',
  orientation: 'any',
  scope: '/',
  short_name: 'Pastime',
  start_url: '/',
  theme_color: '#121212'
}
