import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { removeVersionOneSavedGames } from './saved-game-storage'

const memoryStorage = (entries: Record<string, string>): Storage => {
  const items = new Map(Object.entries(entries))
  return {
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    get length() {
      return items.size
    },
    removeItem: (key) => {
      items.delete(key)
    },
    setItem: (key, value) => {
      items.set(key, value)
    }
  }
}

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
    expect(
      Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index)
      )
    ).toEqual(['pastime.play-record.v1', 'pastime.saved-game.v2.pipes'])
  })
})
