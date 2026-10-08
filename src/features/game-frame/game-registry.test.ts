import { describe, expect, it } from 'vitest'

import { GAMES } from './game-registry'

describe('game registry', () => {
  it.each(GAMES)('[registry] $id starts on a variant it offers', (game) => {
    const offered = game.variants.map((variant) => variant.id)
    expect(offered, `${game.id} default`).toContain(game.defaultVariantId)
  })
})
