import type { GameDefinition } from '@/features/game-frame/game-definition'

import { StarsGlyph } from './presentation/stars-glyph'

export const starsDefinition = {
  chapterInk: '--chapter-stars',
  countsMoves: false,
  Glyph: StarsGlyph,
  id: 'stars',
  load: async () => (await import('./stars-module')).starsModule,
  name: 'games.stars.name',
  rule: 'games.stars.rule',
  variantChoice: 'games.stars.variantChoice',
  variants: [
    { gridSize: 5, id: '5', label: 'games.stars.variants.size5' },
    { gridSize: 6, id: '6', label: 'games.stars.variants.size6' },
    { gridSize: 7, id: '7', label: 'games.stars.variants.size7' },
    { gridSize: 8, id: '8', label: 'games.stars.variants.size8' },
    { gridSize: 9, id: '9', label: 'games.stars.variants.size9' },
    { gridSize: 10, id: '10', label: 'games.stars.variants.size10' },
    { gridSize: 10, id: '10-2', label: 'games.stars.variants.size10Double' }
  ]
} as const satisfies GameDefinition
