import type React from 'react'
import { useState } from 'react'
import { Label, Radio, RadioGroup } from 'react-aria-components'

import {
  playPathFor,
  useOpenPage,
  useRouteData
} from '@/infrastructure/router/navigation'
import { NotFoundPage } from '@/infrastructure/router/route-error'
import { Button } from '@/presentation/components/button'
import { NextIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { formatClockTime } from '@/presentation/format/clock-time'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import type { ChooseLoaderData } from '../choose-loader'
import type { GameDefinition } from '../game-definition'
import { variantOf } from '../game-registry'
import { dropSavedGame, saveVariantPreference } from '../game-storage'
import type { SavedGame } from '../saved-game'
import { BlankGrid } from './blank-grid'
import { GameBand } from './game-band'

import './play-session.sass'
import './choose-page.sass'

type VariantChoiceProps = {
  game: GameDefinition
  variantId: string
  waiting: SavedGame | null
}

/**
 * Before playing: the variant to play, the one played last already picked,
 * and the game left mid-way offered first when there is one.
 */
const VariantChoice: React.FC<VariantChoiceProps> = ({
  game,
  variantId: preferredId,
  waiting
}) => {
  const { locale, translate } = useI18n()
  const openPage = useOpenPage()
  const [variantId, setVariantId] = useState(preferredId)
  const variant = variantOf({ game, variantId })
  const hasNotes = game.variants.some((each) => each.note !== undefined)
  const playPath = playPathFor({ gameId: game.id, locale })

  const playNew = () => {
    saveVariantPreference({ gameId: game.id, variantId })
    if (waiting !== null) dropSavedGame(game.id)
    openPage(playPath)
  }

  return (
    <Main
      className='play-session choose-session'
      style={{ '--chapter': `var(${game.chapterInk})` }}
    >
      <DocumentTitle>
        {`${translate(game.name)} — ${translate('app.name')}`}
      </DocumentTitle>
      <GameBand game={game} />

      <div className='stage-wrap'>
        <div className='board-area'>
          <div aria-hidden='true' className='variant-preview' data-fills-height>
            {variant.gridSize === undefined ? (
              <span className='preview-glyph'>
                <game.Glyph />
              </span>
            ) : (
              <BlankGrid size={variant.gridSize} />
            )}
          </div>
        </div>
      </div>

      <div className='play-panel'>
        <form
          className='variant-choice'
          onSubmit={(event) => {
            event.preventDefault()
            playNew()
          }}
        >
          {waiting !== null && (
            <div className='waiting-game'>
              <Button
                className='choice-action'
                onPress={() => openPage(playPath)}
                variant='ink'
              >
                {translate('frame.choose.resume')}
                <NextIcon aria-hidden='true' />
              </Button>
              <p className='waiting-meta'>
                {translate('frame.choose.waiting', {
                  time: formatClockTime(waiting.elapsedMs),
                  variant: translate(
                    variantOf({ game, variantId: waiting.puzzle.variantId })
                      .label
                  )
                })}
              </p>
            </div>
          )}

          <RadioGroup
            className='variant-group'
            onChange={setVariantId}
            value={variantId}
          >
            <Label className='choice-head'>
              {translate(game.variantChoice)}
            </Label>
            <div className='variant-options' data-wide={hasNotes || undefined}>
              {game.variants.map((each) => (
                <Radio className='variant-option' key={each.id} value={each.id}>
                  <span>{translate(each.label)}</span>
                  {each.note !== undefined && (
                    <small className='variant-note'>
                      {translate(each.note)}
                    </small>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>

          <Button
            className='choice-action'
            type='submit'
            variant={waiting === null ? 'ink' : 'line'}
          >
            {translate(
              waiting === null ? 'frame.choose.play' : 'frame.choose.new'
            )}
            <NextIcon aria-hidden='true' />
          </Button>
        </form>
      </div>
    </Main>
  )
}

/** A game's own address: the choice before playing it. */
export const ChoosePage: React.FC = () => {
  const data = useRouteData<ChooseLoaderData>()
  if (data.status === 'unknown_game') return <NotFoundPage />
  return (
    <VariantChoice
      game={data.game}
      key={data.game.id}
      variantId={data.variantId}
      waiting={data.waiting}
    />
  )
}
