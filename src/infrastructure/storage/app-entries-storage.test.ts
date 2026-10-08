import { Result } from '@adrienlcp/result'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readBackupEntries } from './app-entries-storage'
import { memoryStorage } from './memory-storage'

describe('app entries storage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'localStorage',
      memoryStorage({
        'other-app.theme': 'dark',
        'pastime.next-level.v1.pipes.7': '{"level":{},"seed":1}',
        'pastime.play-record.v1': '{}',
        'pastime.saved-game.v2.pipes': '{}'
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('[backup] carries what the player made, not the levels printed ahead', () => {
    expect(readBackupEntries()).toEqual(
      Result.success({
        'pastime.play-record.v1': '{}',
        'pastime.saved-game.v2.pipes': '{}'
      })
    )
  })
})
