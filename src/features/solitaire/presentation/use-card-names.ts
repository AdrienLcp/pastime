import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  ACE,
  type Card,
  KING,
  rankOf,
  type Suit,
  suitOf
} from '../engine/playing-card'

const FACE_RANKS = {
  [ACE]: 'ace',
  11: 'jack',
  12: 'queen',
  [KING]: 'king'
} as const satisfies Record<number, string>

type FaceRank = keyof typeof FACE_RANKS

const isFaceRank = (rank: number): rank is FaceRank => rank in FACE_RANKS

/** A card's corner mark (« D », « Q », « 10 ») and its name in words. */
export const useCardNames = () => {
  const translate = useTranslate()

  const markOf = (card: Card): string => {
    const rank = rankOf(card)
    return isFaceRank(rank)
      ? translate(`games.solitaire.rankMarks.${FACE_RANKS[rank]}`)
      : String(rank)
  }

  const suitNameOf = (suit: Suit): string =>
    translate(`games.solitaire.suits.${suit}`)

  const nameOf = (card: Card): string => {
    const rank = rankOf(card)
    return translate('games.solitaire.card', {
      rank: isFaceRank(rank)
        ? translate(`games.solitaire.ranks.${FACE_RANKS[rank]}`)
        : String(rank),
      suit: suitNameOf(suitOf(card))
    })
  }

  return { markOf, nameOf, suitNameOf }
}
