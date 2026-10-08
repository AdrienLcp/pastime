import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { GAMES } from '@/features/game-frame/game-registry'
import { SITE_ORIGIN } from '@/infrastructure/site-origin'
import { LOCALES } from '@/presentation/i18n/locale'

const ROOT_DIRECTORY = resolve(import.meta.dirname, '../../..')
const PUBLIC_DIRECTORY = resolve(ROOT_DIRECTORY, 'public')
const INDEX_HTML = readFileSync(resolve(ROOT_DIRECTORY, 'index.html'), 'utf8')
const SITEMAP = readFileSync(resolve(PUBLIC_DIRECTORY, 'sitemap.xml'), 'utf8')

const ogProperty = (property: string): string | undefined =>
  new RegExp(`<meta content="([^"]*)" property="og:${property}"`).exec(
    INDEX_HTML
  )?.[1]

/** A PNG's IHDR chunk holds its width then its height, big-endian, from byte 16. */
const pngSize = (bytes: Buffer): string =>
  `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`

describe('share card', () => {
  test('names the published site', () => {
    expect(ogProperty('url')).toBe(`${SITE_ORIGIN}/`)
    expect(ogProperty('image')).toMatch(new RegExp(`^${SITE_ORIGIN}/`))
  })

  test('ships its image at the size it announces', () => {
    const image = ogProperty('image')?.replace(SITE_ORIGIN, '') ?? ''
    const bytes = readFileSync(resolve(PUBLIC_DIRECTORY, `.${image}`))

    expect(pngSize(bytes)).toBe(
      `${ogProperty('image:width')}x${ogProperty('image:height')}`
    )
  })
})

describe('sitemap', () => {
  const pages = ['', ...GAMES.map((game) => `/${game.id}`)]

  test.each(pages)('lists %s in every language', (page) => {
    for (const locale of LOCALES) {
      expect(SITEMAP).toContain(`<loc>${SITE_ORIGIN}/${locale}${page}</loc>`)
    }
  })

  test('lists nothing else', () => {
    expect(SITEMAP.match(/<loc>/g)).toHaveLength(pages.length * LOCALES.length)
  })
})
