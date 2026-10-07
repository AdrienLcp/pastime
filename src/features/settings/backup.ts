import { Result } from '@adrienlcp/result'
import { z } from 'zod/mini'

import { isAppKey } from '@/infrastructure/storage/app-entries-storage'

/**
 * Everything the app knows, in one file the player can move: changing phone
 * loses nothing, with no server and no account. The entries are the stored
 * texts, raw — each one is checked again by its own reader when the app reads
 * it, so a backup taken by a newer version restores what this one understands.
 */
export type Backup = {
  readonly app: 'pastime'
  readonly version: 1
  /** ISO day the file was written, so a folder of them sorts by itself. */
  readonly savedAt: string
  readonly entries: Readonly<Record<string, string>>
}

/** Why a picked file restores nothing: not ours at all, or ours but broken. */
export type BackupRejection = 'damaged' | 'not_a_backup'

const backupEnvelopeSchema = z.object({
  app: z.literal('pastime'),
  version: z.literal(1)
})

const backupSchema = z.extend(backupEnvelopeSchema, {
  entries: z.record(z.string(), z.string()),
  savedAt: z.catch(z.string(), '')
})

export const gatherBackup = ({
  entries,
  today
}: {
  entries: Record<string, string>
  today: Temporal.PlainDate
}): Backup => ({
  app: 'pastime',
  entries,
  savedAt: today.toString(),
  version: 1
})

const parseJson = (text: string): Result<unknown, 'not_json'> => {
  try {
    const value: unknown = JSON.parse(text)
    return Result.success(value)
  } catch {
    return Result.failure('not_json')
  }
}

/** A file picked by hand is never assumed to be ours; a key not the app's is dropped. */
export const parseBackup = (text: string): Result<Backup, BackupRejection> => {
  const json = parseJson(text)
  if (json.status === 'failure') return Result.failure('not_a_backup')
  if (!backupEnvelopeSchema.safeParse(json.data).success) {
    return Result.failure('not_a_backup')
  }
  const backup = backupSchema.safeParse(json.data)
  if (!backup.success) return Result.failure('damaged')
  return Result.success({
    ...backup.data,
    entries: Object.fromEntries(
      Object.entries(backup.data.entries).filter(([key]) => isAppKey(key))
    )
  })
}

export const backupFileName = (backup: Backup): string =>
  `pastime-${backup.savedAt}.json`

export const serializeBackup = (backup: Backup): string =>
  JSON.stringify(backup, null, 2)
