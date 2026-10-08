import type { ManifestOptions } from 'vite-plugin-pwa'

/**
 * What the browser installs. The colours are the night paper `index.html`
 * announces: the splash screen and the title bar a phone paints before the
 * first frame. No `@/` import, so `vite.config.ts` can load it.
 */
export const webAppManifest: Partial<ManifestOptions> = {
  background_color: '#0d1013',
  categories: ['games', 'entertainment'],
  description:
    'Casse-têtes et jeux de cartes en solo, sans pub ni compte, jouables hors ligne.',
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
  theme_color: '#0d1013'
}
