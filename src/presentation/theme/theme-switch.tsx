import {
  isThemePreference,
  THEME_PREFERENCES
} from '@adrienlcp/theme-preference'
import { useThemePreference } from '@adrienlcp/theme-preference/react'
import type React from 'react'

import { Label, Radio, RadioGroup } from '@/presentation/components/radio-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { themeStore } from './theme-store'

import './theme-switch.sass'

/** Day book, night book, or the device's own: three printed tabs, one pressed. */
export const ThemeSwitch: React.FC = () => {
  const translate = useTranslate()
  const { preference, setPreference } = useThemePreference(themeStore)

  return (
    <RadioGroup
      className='theme-switch'
      onChange={(value) => {
        if (isThemePreference(value)) {
          setPreference(value)
        }
      }}
      orientation='horizontal'
      value={preference}
    >
      <Label className='theme-label'>{translate('theme.label')}</Label>
      <div className='theme-choices'>
        {THEME_PREFERENCES.map((candidate) => (
          <Radio className='theme-choice' key={candidate} value={candidate}>
            {translate(`theme.${candidate}`)}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  )
}
