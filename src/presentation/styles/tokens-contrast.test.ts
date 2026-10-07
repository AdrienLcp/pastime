import { readFileSync } from 'node:fs'

import {
  type ContrastPair,
  findContrastFailures,
  WCAG_AA
} from '@adrienlcp/styles/contrast'
import { expect, it } from 'vitest'

const TOKENS = readFileSync(new URL('_tokens.sass', import.meta.url), 'utf8')

const PAGES = ['--paper', '--paper-sunk', '--sheet']
const PRINT_INKS = ['--ink', '--ink-soft', '--pencil']
const CHAPTER_INKS = [
  '--chapter-pipes',
  '--chapter-solitaire',
  '--chapter-stars',
  '--chapter-color-dots'
]

const PAIRS: ContrastPair[] = [
  ...PAGES.flatMap((background) =>
    PRINT_INKS.map((foreground) => ({
      background,
      foreground,
      minimum: WCAG_AA.text
    }))
  ),
  ...PAGES.flatMap((background) => [
    { background, foreground: '--focus', minimum: WCAG_AA.nonText },
    { background, foreground: '--water', minimum: WCAG_AA.nonText }
  ]),
  { background: '--ink', foreground: '--paper', minimum: WCAG_AA.text },
  { background: '--ink-soft', foreground: '--paper', minimum: WCAG_AA.text },
  ...CHAPTER_INKS.map((background) => ({
    background,
    foreground: '--cover-ink',
    minimum: WCAG_AA.text
  })),
  { background: '--card', foreground: '--card-ink', minimum: WCAG_AA.text },
  { background: '--card', foreground: '--card-red', minimum: WCAG_AA.text },
  { background: '--paper', foreground: '--stamp', minimum: WCAG_AA.largeText }
]

it('[contrast] every ink reads on what it is printed on, in both books', () => {
  expect(findContrastFailures(TOKENS, PAIRS)).toEqual([])
})
