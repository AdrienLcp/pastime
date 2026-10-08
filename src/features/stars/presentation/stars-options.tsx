import type React from 'react'

import {
  changePlaySettings,
  usePlaySettings
} from '@/features/settings/use-play-settings'
import { SettingSwitch } from '@/presentation/components/setting-switch'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

/** Stars' own settings, in its settings panel beside the sizes. */
export const StarsOptions: React.FC = () => {
  const translate = useTranslate()
  const { autoCross } = usePlaySettings()

  return (
    <SettingSwitch
      isOn={autoCross}
      label={translate('games.stars.autoCross.label')}
      onChange={(isOn) => changePlaySettings({ autoCross: isOn })}
      prose={translate('games.stars.autoCross.prose')}
    />
  )
}
