/// <reference types="vitest/config" />
import { resolve } from 'node:path'

import { metricTwins } from '@adrienlcp/styles/metric-twins'
import { themePreferencePlugin } from '@adrienlcp/theme-preference/vite'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import react from '@vitejs/plugin-react'
import fontaine from 'fontaine/postcss'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { webAppManifest } from './src/infrastructure/pwa/web-app-manifest.ts'
import { REGIONAL_LOCALES } from './src/presentation/i18n/regional-locales.ts'
import { themeStore } from './src/presentation/theme/theme-store.ts'

/**
 * Each face gets a fallback face of its own, a local font scaled to the same
 * metrics: text paints at once in it and keeps its place when the real face
 * swaps in. Archivo's and Pastime Hand's are written in `_fonts.sass`, their
 * tabular digits scaled apart.
 */
const HAND_WRITTEN_FALLBACKS = new Set([
  'Archivo fallback',
  'Pastime Hand fallback'
])
const metricMatchedFallbackFaces = fontaine({
  fallbacks: ['Arial'],
  resolvePath: (path) => resolve(import.meta.dirname, 'public', `.${path}`),
  skipFontFaceGeneration: (fallbackName) =>
    HAND_WRITTEN_FALLBACKS.has(fallbackName)
})

export default defineConfig({
  // Absolute, not './': a relative base resolves the assets of a reload on a
  // nested route against that route's folder, and every nested route breaks.
  base: '/',
  css: {
    postcss: { plugins: [metricMatchedFallbackFaces, metricTwins()] }
  },
  plugins: [
    react({ compiler: { logDiagnostics: true } }),
    {
      ...optimizeLocales.vite({ locales: Object.values(REGIONAL_LOCALES) }),
      enforce: 'pre'
    },
    themePreferencePlugin(themeStore),
    VitePWA({
      filename: 'service-worker.ts',
      injectManifest: {
        // The share card is for link previews, never drawn by the app.
        globIgnores: ['og-image.png'],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        // One classic script: the worker imports nothing at runtime, and the
        // 'es' build passes Rolldown the deprecated inlineDynamicImports.
        rollupFormat: 'iife'
      },
      injectRegister: false,
      manifest: webAppManifest,
      registerType: 'prompt',
      srcDir: 'src/service-worker',
      strategies: 'injectManifest'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5530,
    strictPort: true
  },
  test: {
    coverage: {
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary']
    },
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
})
