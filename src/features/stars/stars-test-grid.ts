import type { StarsLevel } from './engine/stars-level'
import type { StarsMark, StarsState } from './engine/stars-state'
import {
  CELL_NO_STAR,
  CELL_OPEN,
  CELL_STAR,
  type Knowledge
} from './solver/stars-knowledge'

const REGION_LETTERS = 'ABCDEFGHIJKLMNO'

/**
 * A grid drawn in text, one string per row: the regions as letters, a space,
 * then the marks — `*` a star, `x` a cross (or a cell known to hold none),
 * `.` still open.
 */
export type DrawnGrid = readonly string[]

const split = (rows: DrawnGrid) =>
  rows.map((row) => {
    const [regions = '', marks = ''] = row.split(' ')
    return { marks, regions }
  })

export const levelOf = (rows: DrawnGrid): StarsLevel => ({
  difficulty: 'single',
  regions: split(rows).flatMap(({ regions }) =>
    [...regions].map((letter) => REGION_LETTERS.indexOf(letter))
  ),
  size: rows.length
})

const MARK_OF_SYMBOL: Record<string, StarsMark> = {
  '.': 'blank',
  '*': 'star',
  x: 'cross'
}

export const stateOf = (rows: DrawnGrid): StarsState => ({
  level: levelOf(rows),
  marks: split(rows).flatMap(({ marks }) =>
    [...marks].map((symbol) => MARK_OF_SYMBOL[symbol] ?? 'blank')
  )
})

const KNOWLEDGE_OF_SYMBOL: Record<string, number> = {
  '.': CELL_OPEN,
  '*': CELL_STAR,
  x: CELL_NO_STAR
}

export const knowledgeOf = (rows: DrawnGrid): Knowledge =>
  Uint8Array.from(
    split(rows).flatMap(({ marks }) =>
      [...marks].map((symbol) => KNOWLEDGE_OF_SYMBOL[symbol] ?? CELL_OPEN)
    )
  )
