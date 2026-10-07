/// <reference types="vitest/config" />
import { resolve } from 'node:path'

import optimizeLocales from '@react-aria/optimize-locales-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { webAppManifest } from './src/infrastructure/pwa/web-app-manifest.ts'
import { REGIONAL_LOCALES } from './src/presentation/i18n/regional-locales.ts'

export default defineConfig({
  // Absolute, not './': a relative base resolves the assets of a reload on a
  // nested route against that route's folder, and every nested route breaks.
  base: '/',
  plugins: [
    react({ compiler: { logDiagnostics: true } }),
    {
      ...optimizeLocales.vite({ locales: Object.values(REGIONAL_LOCALES) }),
      enforce: 'pre'
    },
    VitePWA({
      filename: 'service-worker.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}']
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
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
})
