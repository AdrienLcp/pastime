import { describe, expect, it } from 'vitest'

import { type DrawnGrid, knowledgeOf, levelOf } from '../stars-test-grid'
import { solveStars } from './stars-solver'
import type { StarsTechnique } from './stars-technique'

type Case = {
  technique: StarsTechnique
  grid: DrawnGrid
  starsPerUnit?: 1 | 2
  decides: number[]
}

/**
 * For each technique, a grid where every easier one sees nothing: the
 * solver's first step has to be this one, and decides these cells.
 */
const ONLY_WAY_FORWARD: Case[] = [
  {
    decides: [0, 1, 2, 5, 7, 10, 11, 12],
    grid: [
      'AABBB .....',
      'CCCBB .*...',
      'CCCCB .....',
      'DEEEE .....',
      'DEEEE .....'
    ],
    technique: 'next-to-star'
  },
  {
    decides: [3, 4],
    grid: [
      'AABBB x*x..',
      'CCCBB xxx..',
      'CCCCB .....',
      'DEEEE .....',
      'DEEEE .....'
    ],
    technique: 'full-unit'
  },
  {
    decides: [1],
    grid: [
      'AABBB x.xxx',
      'CCCBB x....',
      'CCCCB x....',
      'DEEEE .....',
      'DEEEE .....'
    ],
    technique: 'single'
  },
  {
    decides: [2, 3, 4],
    grid: [
      'AABBB .....',
      'CCCBB .....',
      'CCCCB .....',
      'DEEEE .....',
      'DEEEE .....'
    ],
    technique: 'confinement'
  },
  {
    decides: [8],
    grid: [
      'AABBB x*xxx',
      'CCCBB xxx..',
      'CCCCB xx..x',
      'DEEEE .x...',
      'DEEEE .x...'
    ],
    technique: 'touching'
  },
  {
    decides: [14],
    grid: [
      'AAABB x.x..',
      'AAAAB x.xx.',
      'DDCEB .x.x.',
      'DDCEB .x.xx',
      'DDEEE xxx..'
    ],
    technique: 'pair'
  },
  {
    decides: [3, 4, 5],
    grid: [
      'ACCCCC .x....',
      'AACCBB ...x..',
      'CCCBBB x....x',
      'ECCCDB .xxx.x',
      'EEEFDD ...xx.',
      'EEEFFF xxx.x.'
    ],
    technique: 'triple'
  },
  {
    decides: [0],
    grid: [
      'AAAAADBBBB ..........',
      'CCADDDDBBF ..........',
      'HCADDDBBBF ..........',
      'HCAAGDDFBF ..........',
      'HEEEGFFFFF ..........',
      'HEIEGGFFFF ..........',
      'HHIEIGGFFF ..........',
      'HIIIIIGJFF ..........',
      'HIIGGGGJJF ..........',
      'IIIIGGGJJF ..........'
    ],
    starsPerUnit: 2,
    technique: 'touching'
  },
  {
    decides: [9, 19],
    grid: [
      'AAABBBBBDD .x*xx.x.x.',
      'AEEBBBBBDD .xxxx.x.x.',
      'EEEBCCCCDD ..xxx.....',
      'EFFFFCCGDD .xx*x.x...',
      'EEFFFCGGGD ..xxx.....',
      'EEHFFGGGDD ..x*x.....',
      'EHHFIGGGGJ ..xxxx....',
      'HHFFIJJJGJ ..xx*x..x.',
      'HHFHIJJJJJ .xxxxx....',
      'HHHHIJJJJJ xx*x*xxxxx'
    ],
    starsPerUnit: 2,
    technique: 'pair'
  }
]

describe('stars solver', () => {
  it.each(ONLY_WAY_FORWARD)(
    '[stars] $technique is the only way forward on its grid',
    ({ decides, grid, starsPerUnit, technique }) => {
      const [first] = solveStars(
        levelOf(grid, starsPerUnit),
        knowledgeOf(grid)
      ).steps
      expect(first?.technique).toBe(technique)
      expect(first?.cells).toEqual(decides)
    }
  )
})
