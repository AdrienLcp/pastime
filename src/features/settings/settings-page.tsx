import type React from 'react'

import {
  hubPathFor,
  useCurrentPathIn,
  useReplacePage
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { FileTrigger } from '@/presentation/components/file-trigger'
import {
  BackIcon,
  ExportIcon,
  ImportIcon
} from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { Main } from '@/presentation/components/main'
import { SegmentedChoice } from '@/presentation/components/segmented-choice'
import { Switch } from '@/presentation/components/switch'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useI18n } from '@/presentation/i18n/i18n-provider'
import { LOCALES, type Locale } from '@/presentation/i18n/locale'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import { useBackup } from './use-backup'
import { changePlaySettings, usePlaySettings } from './use-play-settings'

import './settings-page.sass'

type SettingSwitchProps = {
  label: string
  prose: string
  isOn: boolean
  onChange: (isOn: boolean) => void
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({
  isOn,
  label,
  onChange,
  prose
}) => (
  <Switch className='setting-switch' isSelected={isOn} onChange={onChange}>
    <span className='switch-text'>
      <span className='switch-label'>{label}</span>
      <span className='switch-prose'>{prose}</span>
    </span>
    <span aria-hidden='true' className='switch-track'>
      <span className='switch-knob' />
    </span>
  </Switch>
)

const pickedFile = (files: FileList | null): File | null =>
  files?.item(0) ?? null

/** The device's settings: sound, haptics, theme, language, and the data itself. */
export const SettingsPage: React.FC = () => {
  const { locale, translate } = useI18n()
  const settings = usePlaySettings()
  const pathIn = useCurrentPathIn()
  const replacePage = useReplacePage()
  const backup = useBackup()

  return (
    <Main className='settings-page'>
      <DocumentTitle>{`${translate('settings.title')} — ${translate('app.name')}`}</DocumentTitle>
      <header className='settings-head'>
        <Link
          aria-label={translate('common.backToBook')}
          className='settings-back'
          href={hubPathFor(locale)}
        >
          <BackIcon aria-hidden='true' />
        </Link>
        <h1 className='settings-title'>{translate('settings.title')}</h1>
      </header>

      <div className='settings-group'>
        <SettingSwitch
          isOn={settings.sound}
          label={translate('settings.sound.label')}
          onChange={(sound) => changePlaySettings({ sound })}
          prose={translate('settings.sound.prose')}
        />
        <SettingSwitch
          isOn={settings.haptics}
          label={translate('settings.haptics.label')}
          onChange={(haptics) => changePlaySettings({ haptics })}
          prose={translate('settings.haptics.prose')}
        />
        <SettingSwitch
          isOn={settings.autoCross}
          label={translate('settings.autoCross.label')}
          onChange={(autoCross) => changePlaySettings({ autoCross })}
          prose={translate('settings.autoCross.prose')}
        />
      </div>

      <div className='settings-group'>
        <ThemeSwitch />
        <SegmentedChoice<Locale>
          label={translate('settings.language')}
          onChange={(picked) => replacePage(pathIn(picked))}
          options={LOCALES.map((candidate) => ({
            label: translate(`settings.languages.${candidate}`),
            value: candidate
          }))}
          value={locale}
        />
      </div>

      <section aria-labelledby='settings-backup' className='settings-backup'>
        <h2 className='section-head' id='settings-backup'>
          {translate('settings.backup.title')}
        </h2>
        <p className='backup-prose'>{translate('settings.backup.prose')}</p>
        <div className='backup-actions'>
          <Button onPress={backup.exportBackup} variant='line'>
            <ExportIcon aria-hidden='true' />
            {translate('settings.backup.export')}
          </Button>
          <FileTrigger
            acceptedFileTypes={['application/json', '.json']}
            onSelect={(files) => {
              const file = pickedFile(files)
              if (file !== null) void backup.pickFile(file)
            }}
          >
            <Button variant='line'>
              <ImportIcon aria-hidden='true' />
              {translate('settings.backup.import')}
            </Button>
          </FileTrigger>
        </div>
        <div aria-live='polite' className='backup-outcome'>
          {backup.restore.status === 'confirming' && (
            <div className='restore-confirm'>
              <p>
                {translate('settings.backup.replace', {
                  day: backup.restore.backup.savedAt
                })}
              </p>
              <div className='restore-actions'>
                <Button onPress={backup.confirmRestore} variant='ink'>
                  {translate('settings.backup.confirm')}
                </Button>
                <Button autoFocus onPress={backup.cancelRestore} variant='line'>
                  {translate('settings.backup.cancel')}
                </Button>
              </div>
            </div>
          )}
          {backup.restore.status === 'refused' && (
            <p className='restore-refused'>
              {translate(backup.restore.reason)}
            </p>
          )}
        </div>
      </section>
    </Main>
  )
}
