import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { webAppManifest } from './web-app-manifest'

const ROOT_DIRECTORY = resolve(import.meta.dirname, '../../..')
const PUBLIC_DIRECTORY = resolve(ROOT_DIRECTORY, 'public')
const INDEX_HTML = readFileSync(resolve(ROOT_DIRECTORY, 'index.html'), 'utf8')

const nightThemeColor = (): string | undefined =>
  /<meta content="(#[0-9a-f]{6})" data-scheme="dark"/.exec(INDEX_HTML)?.[1]

/** A PNG's IHDR chunk holds its width then its height, big-endian, from byte 16. */
const pngSize = (bytes: Buffer): string =>
  `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`

describe('web app manifest', () => {
  const icons = webAppManifest.icons ?? []

  test('offers an icon for each purpose the install needs', () => {
    expect(icons.map((icon) => icon.purpose)).toEqual(
      expect.arrayContaining(['any', 'maskable'])
    )
  })

  test('paints the splash screen and title bar in the night paper index.html announces', () => {
    expect(webAppManifest.background_color).toBe(nightThemeColor())
    expect(webAppManifest.theme_color).toBe(nightThemeColor())
  })

  test.each(icons)('ships $src at the $sizes it announces', (icon) => {
    const bytes = readFileSync(resolve(PUBLIC_DIRECTORY, `.${icon.src}`))

    expect(pngSize(bytes)).toBe(icon.sizes)
  })
})
