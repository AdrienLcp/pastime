import { Result } from '@adrienlcp/result'
import { readStoredJson, type StorageReadError } from '@adrienlcp/safe-storage'
import type { z } from 'zod/mini'

const isJson = (_value: unknown): _value is unknown => true

/**
 * The JSON stored under `key`, read through `schema` — its defaults filled in,
 * its unknown fields dropped. `null` when nothing is stored; `'unrecognized'`
 * when the text is not JSON or the schema refuses it.
 */
export const readStoredShape = <Schema extends z.ZodMiniType>({
  key,
  schema
}: {
  key: string
  schema: Schema
}): Result<z.output<Schema> | null, StorageReadError> => {
  const read = readStoredJson({ isValue: isJson, key })
  if (read.status === 'failure') return read
  if (read.data === null) return Result.success(null)
  const parsed = schema.safeParse(read.data)
  return parsed.success
    ? Result.success(parsed.data)
    : Result.failure('unrecognized')
}
