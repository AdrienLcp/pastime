import type { Result } from '@adrienlcp/result'
import {
  readStoredText,
  type StorageWriteError,
  writeStoredText
} from '@adrienlcp/safe-storage'

/** A device choice: declining the install notice once is declining it here. */
const INSTALL_DECLINED_KEY = 'pastime.install-declined'

const DECLINED = 'yes'

export const wasInstallDeclined = (): boolean => {
  const read = readStoredText(INSTALL_DECLINED_KEY)
  return read.status === 'success' && read.data === DECLINED
}

export const writeInstallDeclined = (): Result<void, StorageWriteError> =>
  writeStoredText({ key: INSTALL_DECLINED_KEY, text: DECLINED })
