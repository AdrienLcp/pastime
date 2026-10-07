import {
  THEME_PREFERENCES,
  type ThemePreference
} from '@adrienlcp/theme-preference'
import { useThemePreference } from '@adrienlcp/theme-preference/react'
import type React from 'react'

import { SegmentedChoice } from '@/presentation/components/segmented-choice'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { themeStore } from './theme-store'

/** Day book, night book, or the device's own: three printed tabs, one pressed. */
export const ThemeSwitch: React.FC = () => {
  const translate = useTranslate()
  const { preference, setPreference } = useThemePreference(themeStore)

  return (
    <SegmentedChoice<ThemePreference>
      label={translate('theme.label')}
      onChange={setPreference}
      options={THEME_PREFERENCES.map((candidate) => ({
        label: translate(`theme.${candidate}`),
        value: candidate
      }))}
      value={preference}
    />
  )
}
