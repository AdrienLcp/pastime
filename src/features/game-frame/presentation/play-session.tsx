import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { PreparedPlay } from '../game-loader'
import { GameBand } from './game-band'
import { GameClock } from './game-clock'
import { GameTools } from './game-tools'
import { HintNote } from './hint-note'
import { PauseCover } from './pause-cover'
import { usePlaySession } from './use-play-session'
import { WinSheet } from './win-sheet'

import './play-session.sass'

const ignoreMove = () => undefined

type PlaySessionProps<Level, State, Move, Hint> = {
  play: PreparedPlay<Level, State, Move, Hint>
}

/** One puzzle on the page: its band, its board, its tools, then its stamp. */
export const PlaySession = <Level, State, Move, Hint>({
  play
}: PlaySessionProps<Level, State, Move, Hint>) => {
  const translate = useTranslate()
  const session = usePlaySession(play)
  const { Board, hintKey } = play.module
  const { game, puzzle } = play
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
        {`${translate('common.puzzleNumber')} ${puzzle.number} · ${translate(game.name)} — ${translate('app.name')}`}
      </DocumentTitle>
      <GameBand game={game} puzzle={puzzle}>
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
        <WinSheet
          game={game}
          onReplay={session.replay}
          plate={
            <Board
              hint={null}
              isLocked
              onMove={ignoreMove}
              state={session.board}
            />
          }
          puzzle={puzzle}
          summary={session.win}
        />
      ) : (
        <>
          <div className='board-area'>
            {session.status === 'paused' ? (
              <PauseCover onResume={session.resume} />
            ) : (
              <Board
                hint={hint}
                isLocked={false}
                onMove={session.move}
                state={session.board}
              />
            )}
          </div>
          <HintNote explanation={explanation} />
          <GameTools
            canUndo={session.canUndo}
            isPaused={session.status === 'paused'}
            onHint={session.showHint}
            onRestart={session.restart}
            onUndo={session.undo}
          />
        </>
      )}
    </Main>
  )
}
