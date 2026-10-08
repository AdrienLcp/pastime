import type React from 'react'
import { useState } from 'react'

import { warnOnFailure } from '@/infrastructure/diagnostics'
import { applyUpdate, useAppUpdate } from '@/infrastructure/pwa/app-update'
import {
  promptInstall,
  useInstallState
} from '@/infrastructure/pwa/install-prompt'
import {
  wasInstallDeclined,
  writeInstallDeclined
} from '@/infrastructure/storage/install-choice-storage'
import { Button } from '@/presentation/components/button'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './app-notices.sass'

type NoticeProps = {
  children: React.ReactNode
  /** The notice's one or two actions, at its end. */
  actions: React.ReactNode
}

const Notice: React.FC<NoticeProps> = ({ actions, children }) => (
  <div className='app-notice' role='status'>
    <p className='notice-text'>{children}</p>
    <div className='notice-actions'>{actions}</div>
  </div>
)

const offerInstall = () => {
  void promptInstall()
}

/**
 * The app's notices: that a new version is ready, that the app can be
 * installed. Each holds until it is answered; none of them covers the page.
 * They are printed at the end of the contents, never above them: a notice that
 * arrives after the first paint must push nothing the player is looking at.
 */
export const AppNotices: React.FC = () => {
  const translate = useTranslate()
  const { isUpdateWaiting } = useAppUpdate()
  const install = useInstallState()
  const [isInstallDeclined, setIsInstallDeclined] = useState(wasInstallDeclined)

  const declineInstall = () => {
    setIsInstallDeclined(true)
    warnOnFailure(
      writeInstallDeclined(),
      'The install choice could not be saved'
    )
  }

  return (
    <div className='app-notices'>
      {isUpdateWaiting && (
        <Notice
          actions={
            <Button onPress={applyUpdate}>
              {translate('pwa.update.action')}
            </Button>
          }
        >
          {translate('pwa.update.text')}
        </Notice>
      )}

      {install === 'offered' && !isInstallDeclined && !isUpdateWaiting && (
        <Notice
          actions={
            <>
              <Button onPress={offerInstall}>
                {translate('pwa.install.action')}
              </Button>
              <Button onPress={declineInstall}>
                {translate('pwa.install.decline')}
              </Button>
            </>
          }
        >
          {translate('pwa.install.text')}
        </Notice>
      )}
    </div>
  )
}
