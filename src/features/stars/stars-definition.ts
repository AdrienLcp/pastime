import type { GameDefinition } from '@/features/game-frame/game-definition'

import { StarsGlyph } from './presentation/stars-glyph'

export const starsDefinition = {
  chapterInk: '--chapter-stars',
  countsMoves: false,
  defaultVariantId: '11',
  Glyph: StarsGlyph,
  id: 'stars',
  load: async () => (await import('./stars-module')).starsModule,
  name: 'games.stars.name',
  rule: 'games.stars.rule',
  variantChoice: 'games.stars.variantChoice',
  variants: [
    { gridSize: 7, id: '7', label: 'games.stars.variants.size7' },
    { gridSize: 9, id: '9', label: 'games.stars.variants.size9' },
    { gridSize: 11, id: '11', label: 'games.stars.variants.size11' },
    { gridSize: 13, id: '13', label: 'games.stars.variants.size13' },
    { gridSize: 15, id: '15', label: 'games.stars.variants.size15' }
  ]
} as const satisfies GameDefinition
