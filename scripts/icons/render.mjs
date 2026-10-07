// Renders the home-screen icons from their SVG sources into public/icons/:
//
//   pnpm icons

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = fileURLToPath(new URL('../../', import.meta.url))

const ICONS = [
  { output: 'apple-touch-icon.png', size: 180, source: 'public/favicon.svg' },
  { output: 'icon-192.png', size: 192, source: 'public/favicon.svg' },
  { output: 'icon-512.png', size: 512, source: 'public/favicon.svg' },
  {
    output: 'icon-maskable-512.png',
    size: 512,
    source: 'scripts/icons/maskable.svg'
  }
]

for (const { output, size, source } of ICONS) {
  const svg = readFileSync(`${root}${source}`, 'utf8').replace(
    '<svg ',
    `<svg width="${size}" height="${size}" `
  )
  await sharp(Buffer.from(svg))
    .removeAlpha()
    .png()
    .toFile(`${root}public/icons/${output}`)
  process.stdout.write(`icons: ${output} (${size}px) from ${source}\n`)
}
