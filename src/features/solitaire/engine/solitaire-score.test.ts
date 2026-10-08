import { describe, expect, it } from 'vitest'

import {
  currentBoard,
  type GameSession,
  playMove,
  startSession,
  undoMove
} from '@/features/game-frame/game-session'
import { createSeededRandom } from '@/helpers/seeded-random'

import { type Card, cardOf, FRESH_DECK, suitIndexOf } from './playing-card'
import { solitaireEngine } from './solitaire-engine'
import type { SolitaireLevel } from './solitaire-level'
import { solitaireScoreOf, solitaireTimeBonusOf } from './solitaire-score'
import type {
  Pile,
  SolitaireMove,
  SolitaireState,
  TableauColumn,
  TargetPile
} from './solitaire-state'

type Session = GameSession<SolitaireLevel, SolitaireState, SolitaireMove>

const levelDrawing = (draw: 1 | 3): SolitaireLevel => ({
  deck: createSeededRandom(1).shuffled(FRESH_DECK),
  draw
})

const ACE_OF_HEARTS = cardOf({ rank: 1, suit: 'hearts' })
const ACE_OF_SPADES = cardOf({ rank: 1, suit: 'spades' })
const ACE_OF_CLUBS = cardOf({ rank: 1, suit: 'clubs' })
const TWO_OF_HEARTS = cardOf({ rank: 2, suit: 'hearts' })
const BLACK_THREE = cardOf({ rank: 3, suit: 'clubs' })
const KING_OF_DIAMONDS = cardOf({ rank: 13, suit: 'diamonds' })
const FACE_DOWN_KING = cardOf({ rank: 13, suit: 'clubs' })

const faceUp = (...cards: Card[]): TableauColumn => ({ cards, hidden: 0 })

const EMPTY: TableauColumn = { cards: [], hidden: 0 }
const STILL_HIDDEN: TableauColumn = {
  cards: [FACE_DOWN_KING, cardOf({ rank: 12, suit: 'diamonds' })],
  hidden: 1
}

const sessionAt = ({
  draw = 1,
  foundations = [[], [], [], []],
  tableau,
  waste
}: {
  draw?: 1 | 3
  foundations?: Card[][]
  waste: Card[]
  tableau: TableauColumn[]
}): Session => {
  const session = startSession(solitaireEngine, levelDrawing(draw))
  const board: SolitaireState = {
    ...session.boards[0],
    foundations,
    stock: [],
    tableau: Array.from({ length: 7 }, (_, index) => tableau[index] ?? EMPTY),
    waste
  }
  return { ...session, boards: [board] }
}

const played = (session: Session, ...moves: SolitaireMove[]): Session =>
  moves.reduce((current, move) => {
    const next = playMove(solitaireEngine, current, move)
    if (next.status === 'failure') throw new Error('refused')
    return next.data
  }, session)

const scoreOf = (session: Session) => solitaireScoreOf(session)

const homeOf = (card: Card) => ({
  kind: 'foundation' as const,
  suit: suitIndexOf(card)
})

const move = (from: Pile, to: TargetPile): SolitaireMove => ({
  count: 1,
  from,
  kind: 'move',
  to
})

const WASTE: Pile = { kind: 'waste' }
const column = (index: number) => ({ column: index, kind: 'tableau' as const })

describe('solitaire score', () => {
  it('[solitaire] scores the Windows way: +10 home, +5 from the waste to the tableau, +5 a card turned over, −15 off a foundation', () => {
    const start = sessionAt({
      tableau: [
        { cards: [FACE_DOWN_KING, ACE_OF_HEARTS], hidden: 1 },
        { cards: [KING_OF_DIAMONDS, BLACK_THREE], hidden: 0 }
      ],
      waste: [TWO_OF_HEARTS, ACE_OF_SPADES]
    })
    const aceFromWaste = played(start, move(WASTE, homeOf(ACE_OF_SPADES)))
    expect(scoreOf(aceFromWaste)).toBe(10)
    const aceTurningOver = played(
      aceFromWaste,
      move(column(0), homeOf(ACE_OF_HEARTS))
    )
    expect(scoreOf(aceTurningOver)).toBe(25)
    const twoOnThree = played(aceTurningOver, move(WASTE, column(1)))
    expect(scoreOf(twoOnThree)).toBe(30)
    const twoHome = played(twoOnThree, move(column(1), homeOf(TWO_OF_HEARTS)))
    expect(scoreOf(twoHome)).toBe(40)
    const twoBack = played(twoHome, move(homeOf(TWO_OF_HEARTS), column(1)))
    expect(scoreOf(twoBack)).toBe(25)
  })

  it('[solitaire] never scores below zero', () => {
    const start = sessionAt({
      foundations: [[], [], [ACE_OF_HEARTS, TWO_OF_HEARTS], []],
      tableau: [faceUp(BLACK_THREE), STILL_HIDDEN],
      waste: []
    })
    const twoOut = played(start, move(homeOf(TWO_OF_HEARTS), column(0)))
    expect(scoreOf(twoOut)).toBe(0)
    expect(
      scoreOf(played(twoOut, move(column(0), homeOf(TWO_OF_HEARTS))))
    ).toBe(10)
  })

  it('[solitaire] takes an undone move’s points back exactly', () => {
    const start = sessionAt({
      tableau: [{ cards: [FACE_DOWN_KING, ACE_OF_HEARTS], hidden: 1 }],
      waste: [ACE_OF_SPADES]
    })
    const first = played(start, move(WASTE, homeOf(ACE_OF_SPADES)))
    const second = played(first, move(column(0), homeOf(ACE_OF_HEARTS)))
    expect(scoreOf(second)).toBe(25)
    const undone = undoMove(second)
    expect(scoreOf(undone)).toBe(10)
    expect(currentBoard(undone)).toEqual(currentBoard(first))
    expect(scoreOf(undoMove(undone))).toBe(0)
  })

  it('[solitaire] costs 100 for every pass after the first, drawing one', () => {
    const start = sessionAt({
      tableau: [STILL_HIDDEN],
      waste: [ACE_OF_CLUBS, ACE_OF_HEARTS, ACE_OF_SPADES]
    })
    const earned = played(
      start,
      move(WASTE, homeOf(ACE_OF_SPADES)),
      move(WASTE, homeOf(ACE_OF_HEARTS))
    )
    expect(scoreOf(earned)).toBe(20)
    expect(scoreOf(played(earned, { kind: 'recycle' }))).toBe(0)
  })

  it('[solitaire] costs 20 for every pass after the third, drawing three', () => {
    const start = sessionAt({
      draw: 3,
      tableau: [STILL_HIDDEN],
      waste: [TWO_OF_HEARTS, ACE_OF_CLUBS, ACE_OF_HEARTS, ACE_OF_SPADES]
    })
    const earned = played(
      start,
      move(WASTE, homeOf(ACE_OF_SPADES)),
      move(WASTE, homeOf(ACE_OF_HEARTS)),
      move(WASTE, homeOf(ACE_OF_CLUBS))
    )
    expect(scoreOf(earned)).toBe(30)
    const pass = { kind: 'draw' } as const
    const thirdPass = played(
      earned,
      { kind: 'recycle' },
      pass,
      { kind: 'recycle' },
      pass
    )
    expect(scoreOf(thirdPass)).toBe(30)
    expect(scoreOf(played(thirdPass, { kind: 'recycle' }))).toBe(10)
  })

  it('[solitaire] recycles for free once every tableau card is face up', () => {
    const start = sessionAt({
      tableau: [faceUp(BLACK_THREE)],
      waste: [TWO_OF_HEARTS, ACE_OF_SPADES]
    })
    const earned = played(start, move(WASTE, homeOf(ACE_OF_SPADES)))
    expect(scoreOf(played(earned, { kind: 'recycle' }))).toBe(10)
  })

  it('[solitaire] adds 700 000 over the seconds played, from 30 s on', () => {
    expect(solitaireTimeBonusOf(29_999)).toBe(0)
    expect(solitaireTimeBonusOf(30_000)).toBe(23_333)
    expect(solitaireTimeBonusOf(100_400)).toBe(7000)
  })
})
