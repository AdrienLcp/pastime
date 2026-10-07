import type React from 'react'

import { type Card, isRed, suitOf } from '../engine/playing-card'
import { SuitMark } from './suit-mark'

type PlayingCardFacesProps = {
  readonly card: Card
  readonly mark: string
}

/**
 * Both sides of a card, back to back: the card turns over by turning this
 * round, so a card dealt face down flips as it is revealed.
 */
export const PlayingCardFaces: React.FC<PlayingCardFacesProps> = ({
  card,
  mark
}) => {
  const suit = suitOf(card)
  return (
    <div className='card-turn'>
      <div className='card-face' data-red={isRed(card) || undefined}>
        <span className='card-rank'>{mark}</span>
        <SuitMark className='card-pip' suit={suit} />
        <SuitMark className='card-big-pip' suit={suit} />
      </div>
      <div className='card-back' />
    </div>
  )
}
