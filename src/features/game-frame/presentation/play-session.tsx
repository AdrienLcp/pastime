import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { PreparedPlay } from '../game-loader'
import { GameBand } from './game-band'
import { GameClock } from './game-clock'
import { GameTools } from './game-tools'
import { HintNote, LostNote } from './hint-note'
import { PauseCover } from './pause-cover'
import { usePlaySession } from './use-play-session'
import { usePrintAhead } from './use-print-ahead'
import { WinPlate, WinSheet } from './win-sheet'

import './play-session.sass'

const ignoreMove = () => undefined

type PlaySessionProps<Level, State, Move, Hint> = {
  play: PreparedPlay<Level, State, Move, Hint>
}

/**
 * One puzzle on the page: its band, its board, its tools, then its stamp. A
 * phone stacks them; a spread puts the board on the left page and the band
 * over the tools, or the score, on the right.
 */
export const PlaySession = <Level, State, Move, Hint>({
  play
}: PlaySessionProps<Level, State, Move, Hint>) => {
  const translate = useTranslate()
  const session = usePlaySession(play)
  usePrintAhead(play)
  const { Board, hintKey } = play.module
  const { game } = play
  const hint =
    session.shownHint?.kind === 'step' ? session.shownHint.hint : null
  const explanation =
    session.shownHint === null
      ? null
      : session.shownHint.kind === 'step'
        ? hintKey(session.shownHint.hint)
        : 'frame.hint.none'

  return (
    <Main
      className='play-session'
      style={{ '--chapter': `var(${game.chapterInk})` }}
    >
      <DocumentTitle>
        {`${translate(game.name)} — ${translate('app.name')}`}
      </DocumentTitle>
      <GameBand game={game}>
        {session.status !== 'won' && (
          <GameClock
            clock={session.clock}
            isPaused={session.status === 'paused'}
            isRunning={session.isClockRunning}
            onPause={session.pause}
            onResume={session.resume}
          />
        )}
      </GameBand>

      {session.status === 'won' && session.win !== null ? (
        <>
          <div className='stage-wrap'>
            <div className='board-area'>
              <WinPlate>
                <Board
                  hint={null}
                  isLocked
                  onMove={ignoreMove}
                  state={session.board}
                />
              </WinPlate>
            </div>
          </div>
          <div className='play-panel'>
            <WinSheet
              game={game}
              onReplay={session.replay}
              summary={session.win}
            />
          </div>
        </>
      ) : (
        <>
          <div className='stage-wrap'>
            <div className='board-area'>
              {session.status === 'paused' ? (
                <PauseCover onResume={session.resume} />
              ) : (
                <Board
                  hint={hint}
                  isLocked={session.status === 'lost'}
                  onMove={session.move}
                  state={session.board}
                />
              )}
            </div>
            {session.status === 'lost' && session.isLossTold ? (
              <LostNote />
            ) : (
              <HintNote explanation={explanation} />
            )}
          </div>
          <div className='play-panel'>
            <GameTools
              canHint={session.status !== 'lost'}
              canUndo={session.canUndo}
              isPaused={session.status === 'paused'}
              onHint={session.showHint}
              onRestart={session.restart}
              onUndo={session.undo}
            />
          </div>
        </>
      )}
    </Main>
  )
}
