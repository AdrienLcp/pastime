import type { Result } from '@adrienlcp/result'
import {
  type StorageReadError,
  type StorageWriteError,
  writeStoredJson
} from '@adrienlcp/safe-storage'

import {
  type PlayRecord,
  playRecordSchema
} from '@/features/game-frame/play-record'

import { readStoredShape } from './read-stored-shape'

const PLAY_RECORD_KEY = 'pastime.play-record.v1'

/** `null` before the first win on this device. */
export const readPlayRecord = (): Result<PlayRecord | null, StorageReadError> =>
  readStoredShape({ key: PLAY_RECORD_KEY, schema: playRecordSchema })

export const writePlayRecord = (
  record: PlayRecord
): Result<void, StorageWriteError> =>
  writeStoredJson({ key: PLAY_RECORD_KEY, value: record })
