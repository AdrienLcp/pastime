import type { Result } from '@adrienlcp/result'
import {
  removeStored,
  type StorageReadError,
  type StorageUnavailable,
  type StorageWriteError,
  writeStoredJson
} from '@adrienlcp/safe-storage'

import {
  type ReadyLevel,
  readyLevelSchema
} from '@/features/game-frame/ready-level'

import { readStoredShape } from './read-stored-shape'

const READY_LEVEL_KEY_PREFIX = 'pastime.next-level.v1.'

type Slot = { gameId: string; variantId: string }

const readyLevelKey = ({ gameId, variantId }: Slot) =>
  `${READY_LEVEL_KEY_PREFIX}${gameId}.${variantId}`

/** A level printed ahead is a cache the device prints again: no backup carries it. */
export const isReadyLevelKey = (key: string): boolean =>
  key.startsWith(READY_LEVEL_KEY_PREFIX)

/** `null` when no level waits for this game and variant. */
export const readReadyLevel = (
  slot: Slot
): Result<ReadyLevel | null, StorageReadError> =>
  readStoredShape({ key: readyLevelKey(slot), schema: readyLevelSchema })

export const writeReadyLevel = ({
  ready,
  ...slot
}: Slot & { ready: ReadyLevel }): Result<void, StorageWriteError> =>
  writeStoredJson({ key: readyLevelKey(slot), value: ready })

export const removeReadyLevel = (
  slot: Slot
): Result<void, StorageUnavailable> => removeStored(readyLevelKey(slot))
