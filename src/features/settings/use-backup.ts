import { useState } from 'react'

import {
  downloadTextFile,
  readFileText,
  reloadPage
} from '@/infrastructure/browser'
import { today } from '@/infrastructure/clock'
import { warnOnFailure } from '@/infrastructure/diagnostics'
import {
  readBackupEntries,
  replaceAppEntries
} from '@/infrastructure/storage/app-entries-storage'
import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import {
  type Backup,
  backupFileName,
  gatherBackup,
  parseBackup,
  serializeBackup
} from './backup'

/** Where a restore stands: nothing picked, a file waiting to be confirmed, or a refusal. */
export type RestoreState =
  | { readonly status: 'idle' }
  | { readonly status: 'confirming'; readonly backup: Backup }
  | { readonly status: 'refused'; readonly reason: PlainTranslationKey }

/**
 * Saving everything to a file, and putting a file back. A restore replaces
 * everything, so it asks first, and the page reloads onto what it restored —
 * the theme, the language, the games in progress all read afresh.
 */
export const useBackup = () => {
  const [restore, setRestore] = useState<RestoreState>({ status: 'idle' })

  const exportBackup = () => {
    const entries = readBackupEntries()
    warnOnFailure(entries, 'The stored data could not be read for the backup')
    const backup = gatherBackup({
      entries: entries.status === 'success' ? entries.data : {},
      today: today()
    })
    warnOnFailure(
      downloadTextFile({
        name: backupFileName(backup),
        text: serializeBackup(backup),
        type: 'application/json'
      }),
      'The backup file could not be offered'
    )
  }

  const pickFile = async (file: File) => {
    const text = await readFileText(file)
    if (text.status === 'failure') {
      return setRestore({
        reason: 'settings.backup.unreadable',
        status: 'refused'
      })
    }
    const backup = parseBackup(text.data)
    if (backup.status === 'failure') {
      return setRestore({
        reason:
          backup.error === 'damaged'
            ? 'settings.backup.damaged'
            : 'settings.backup.notABackup',
        status: 'refused'
      })
    }
    setRestore({ backup: backup.data, status: 'confirming' })
  }

  const confirmRestore = () => {
    if (restore.status !== 'confirming') return
    const replaced = replaceAppEntries(restore.backup.entries)
    if (replaced.status === 'failure') {
      return setRestore({
        reason: 'settings.backup.storageRefused',
        status: 'refused'
      })
    }
    reloadPage()
  }

  return {
    cancelRestore: () => setRestore({ status: 'idle' }),
    confirmRestore,
    exportBackup,
    pickFile,
    restore
  }
}
