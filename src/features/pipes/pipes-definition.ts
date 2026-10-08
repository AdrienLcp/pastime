import type { GameDefinition } from '@/features/game-frame/game-definition'

import { PipesGlyph } from './presentation/pipes-glyph'

export const pipesDefinition = {
  chapterInk: '--chapter-pipes',
  countsMoves: false,
  Glyph: PipesGlyph,
  id: 'pipes',
  load: async () => (await import('./pipes-module')).pipesModule,
  name: 'games.pipes.name',
  rule: 'games.pipes.rule',
  variantChoice: 'games.pipes.variantChoice',
  variants: [
    { gridSize: 5, id: '5', label: 'games.pipes.variants.size5' },
    { gridSize: 7, id: '7', label: 'games.pipes.variants.size7' },
    { gridSize: 9, id: '9', label: 'games.pipes.variants.size9' },
    { gridSize: 11, id: '11', label: 'games.pipes.variants.size11' },
    { gridSize: 13, id: '13', label: 'games.pipes.variants.size13' }
  ]
} as const satisfies GameDefinition
