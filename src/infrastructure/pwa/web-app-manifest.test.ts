import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { webAppManifest } from './web-app-manifest'

const PUBLIC_DIRECTORY = resolve(import.meta.dirname, '../../../public')

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

  test.each(icons)('ships $src at the $sizes it announces', (icon) => {
    const bytes = readFileSync(resolve(PUBLIC_DIRECTORY, `.${icon.src}`))

    expect(pngSize(bytes)).toBe(icon.sizes)
  })
})
