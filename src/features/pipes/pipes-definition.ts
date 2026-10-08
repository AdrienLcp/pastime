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
  variants: [
    { id: '5', label: 'games.pipes.variants.size5' },
    { id: '7', label: 'games.pipes.variants.size7' },
    { id: '9', label: 'games.pipes.variants.size9' },
    { id: '11', label: 'games.pipes.variants.size11' },
    { id: '13', label: 'games.pipes.variants.size13' }
  ]
} as const satisfies GameDefinition
