import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { memoryStorage, storedKeys } from './memory-storage'
import { removeVersionOneSavedGames } from './saved-game-storage'

describe('saved game storage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'localStorage',
      memoryStorage({
        'pastime.play-record.v1': '{}',
        'pastime.saved-game.v1.stars.daily': '{}',
        'pastime.saved-game.v1.stars.free': '{}',
        'pastime.saved-game.v2.pipes': '{}'
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('[storage] removes the games version 1 left and keeps everything else', () => {
    expect(removeVersionOneSavedGames().status).toBe('success')
    expect(storedKeys(localStorage)).toEqual([
      'pastime.play-record.v1',
      'pastime.saved-game.v2.pipes'
    ])
  })
})
