import type { GameDefinition } from '@/features/game-frame/game-definition'

import { ColorDotsGlyph } from './presentation/color-dots-glyph'

export const colorDotsDefinition = {
  chapterInk: '--chapter-color-dots',
  countsMoves: false,
  Glyph: ColorDotsGlyph,
  id: 'color-dots',
  load: async () => (await import('./color-dots-module')).colorDotsModule,
  name: 'games.colorDots.name',
  rule: 'games.colorDots.rule',
  variants: [
    { id: 'easy', label: 'games.colorDots.variants.easy' },
    { id: 'hard', label: 'games.colorDots.variants.hard' },
    { id: 'expert', label: 'games.colorDots.variants.expert' }
  ]
} as const satisfies GameDefinition
