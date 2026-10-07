import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import type { BoardProps } from '@/features/game-frame/game-module'
import { Button } from '@/presentation/components/button'
import { RestartIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { type Card, DECK_SIZE, FRESH_DECK, SUITS } from '../engine/playing-card'
import type { SolitaireHint } from '../engine/solitaire-hint'
import { cardsOf, isLegalMove } from '../engine/solitaire-rules'
import type { SolitaireMove, SolitaireState } from '../engine/solitaire-state'
import { hintMarksOf } from './hint-marks'
import { PlayingCardFaces } from './playing-card'
import { SuitMark } from './suit-mark'
import {
  dropTargetAt,
  type Lift,
  pileKeyOf,
  type Rect,
  type TablePile,
  tableLayoutOf
} from './table-layout'
import { liftToPlay } from './tap-destinations'
import { useAutoComplete } from './use-auto-complete'
import { type Drag, useCardDrag } from './use-card-drag'
import { useCardNames } from './use-card-names'
import { useElementSize } from './use-element-size'
import { useMovedCards } from './use-moved-cards'
import { usePileLabels } from './use-pile-labels'
import { useTapMoves } from './use-tap-moves'

import './solitaire-board.sass'

/** How long a refused card shakes its head. */
const REFUSAL_MS = 380

/** Above every pile while the last move's cards land. */
const MOVED_LAYER = 100
/** Above everything while in the player's hand. */
const LIFTED_LAYER = 200

const placeOf = (rect: Rect): React.CSSProperties => ({
  height: rect.height,
  transform: `translate(${rect.x}px, ${rect.y}px)`,
  width: rect.width
})

/**
 * A Klondike table: every card laid out from the state and slid to its new
 * place on each move. Drag a stack onto a pile, or tap it and it goes where
 * it fits best — tapping again tries the next place. The keyboard plays each
 * pile as a whole through a row of buttons laid over them.
 */
export const SolitaireBoard: React.FC<
  BoardProps<SolitaireState, SolitaireMove, SolitaireHint>
> = ({ hint, isLocked, onMove, state }) => {
  const translate = useTranslate()
  const { markOf } = useCardNames()
  const pileLabelOf = usePileLabels(state)
  const { ref, size } = useElementSize<HTMLDivElement>()
  const [refused, setRefused] = useState<Card | null>(null)
  const { tap } = useTapMoves({ onMove, state })
  const { canFinish, finish } = useAutoComplete({ onMove, state })

  const layout = useMemo(
    () =>
      size === null || size.width === 0
        ? null
        : tableLayoutOf({
            availableHeight: isLocked ? null : size.height,
            state,
            width: size.width
          }),
    [isLocked, size, state]
  )
  const moved = useMovedCards(layout?.spots ?? null)
  const marks = useMemo(() => hintMarksOf(state, hint), [hint, state])

  useEffect(() => {
    if (refused === null) return
    const timer = setTimeout(() => setRefused(null), REFUSAL_MS)
    return () => clearTimeout(timer)
  }, [refused])

  const leadOf = (lift: Lift) => cardsOf(state, lift.from).at(-lift.count)

  const playTap = (lift: Lift) => {
    if (!tap(lift)) setRefused(leadOf(lift) ?? null)
  }

  const playDrop = ({ dx, dy, lift }: Drag) => {
    const lead = leadOf(lift)
    const spot = lead === undefined ? undefined : layout?.spots.get(lead)
    if (layout === null || lead === undefined || spot === undefined) return
    const to = dropTargetAt({
      card: lead,
      layout,
      point: {
        x: spot.x + dx + layout.cardWidth / 2,
        y: spot.y + dy + layout.cardHeight / 2
      }
    })
    if (to === null) return
    const move: SolitaireMove = { ...lift, kind: 'move', to }
    if (isLegalMove(state, move)) onMove(move)
  }

  const { cardProps, drag } = useCardDrag({
    onDrop: playDrop,
    onTap: playTap
  })

  const lifted = useMemo(
    () =>
      new Set(
        drag === null
          ? []
          : cardsOf(state, drag.lift.from).slice(-drag.lift.count)
      ),
    [drag, state]
  )

  const turnStock = () => {
    if (state.stock.length > 0) onMove({ kind: 'draw' })
    else if (state.waste.length > 0) onMove({ kind: 'recycle' })
  }

  const playPile = (pile: TablePile) => {
    if (pile.kind === 'stock') return turnStock()
    const lift = liftToPlay(state, pile)
    if (lift === null) setRefused(cardsOf(state, pile).at(-1) ?? null)
    else playTap(lift)
  }

  const homeCount = state.foundations.reduce(
    (count, foundation) => count + foundation.length,
    0
  )

  return (
    <div
      className='solitaire-board'
      data-fills-height={isLocked ? undefined : true}
    >
      <div
        className='table'
        ref={ref}
        {...(isLocked
          ? { 'aria-label': translate('games.solitaire.board'), role: 'img' }
          : {})}
        style={
          layout === null
            ? undefined
            : {
                '--card-height': `${layout.cardHeight}px`,
                '--card-width': `${layout.cardWidth}px`,
                height: isLocked ? layout.height : undefined
              }
        }
      >
        {layout?.piles.map(({ area, pile }) => {
          const key = pileKeyOf(pile)
          return (
            <div
              aria-hidden='true'
              className='slot'
              data-hinted={marks.pileKey === key || undefined}
              data-kind={pile.kind}
              key={key}
              style={placeOf({ ...area, height: layout.cardHeight })}
            >
              {pile.kind === 'foundation' && (
                <SuitMark
                  className='slot-mark'
                  suit={SUITS[pile.suit] ?? 'clubs'}
                />
              )}
              {pile.kind === 'stock' &&
                state.stock.length === 0 &&
                state.waste.length > 0 && <RestartIcon className='slot-mark' />}
            </div>
          )
        })}

        {layout !== null &&
          FRESH_DECK.map((card) => {
            const spot = layout.spots.get(card)
            if (spot === undefined) return null
            const isLifted = lifted.has(card)
            const layer = isLifted
              ? LIFTED_LAYER
              : moved.has(card)
                ? MOVED_LAYER
                : 0
            const x = spot.x + (isLifted && drag !== null ? drag.dx : 0)
            const y = spot.y + (isLifted && drag !== null ? drag.dy : 0)
            const canLift = !isLocked && spot.lift !== null
            return (
              <div
                aria-hidden='true'
                className='card'
                data-face-down={!spot.isFaceUp || undefined}
                data-hinted={marks.cards.get(card)}
                data-liftable={canLift || undefined}
                data-lifted={isLifted || undefined}
                data-refused={refused === card || undefined}
                key={card}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  zIndex: layer + spot.z
                }}
                {...(canLift && spot.lift !== null ? cardProps(spot.lift) : {})}
              >
                <PlayingCardFaces card={card} mark={markOf(card)} />
              </div>
            )
          })}

        {!isLocked && layout !== null && (
          <fieldset
            aria-label={translate('games.solitaire.board')}
            className='piles'
          >
            {layout.piles.map(({ area, pile }) => (
              <button
                aria-label={pileLabelOf(pile)}
                className='pile-button'
                data-kind={pile.kind}
                key={pileKeyOf(pile)}
                onClick={() => playPile(pile)}
                style={{ ...placeOf(area), zIndex: LIFTED_LAYER + DECK_SIZE }}
                type='button'
              />
            ))}
          </fieldset>
        )}
      </div>

      {!isLocked && (
        <div className='status-line'>
          <p className='home-count'>
            {translate('games.solitaire.homeCount', {
              count: homeCount,
              total: DECK_SIZE
            })}
          </p>
          {canFinish && (
            <Button className='finish' onPress={finish}>
              {translate('games.solitaire.finish')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
