import type React from 'react'

import { Button } from '@/presentation/components/button'
import { ResumeIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './pause-cover.sass'

/** Laid over the board while paused: the grid hidden, so the clock stays honest. */
export const PauseCover: React.FC<{ onResume: () => void }> = ({
  onResume
}) => {
  const translate = useTranslate()

  return (
    <section aria-labelledby='pause-title' className='pause-cover'>
      <h2 className='pause-title' id='pause-title'>
        {translate('frame.paused.title')}
      </h2>
      <p className='pause-prose'>{translate('frame.paused.prose')}</p>
      <Button autoFocus onPress={onResume} variant='ink'>
        <ResumeIcon aria-hidden='true' />
        {translate('frame.paused.resume')}
      </Button>
    </section>
  )
}
