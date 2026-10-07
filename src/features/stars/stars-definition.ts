import type { GameDefinition } from '@/features/game-frame/game-definition'

import { StarsGlyph } from './presentation/stars-glyph'

export const starsDefinition = {
  chapterInk: '--chapter-stars',
  dailyVariant: '8',
  Glyph: StarsGlyph,
  id: 'stars',
  load: async () => (await import('./stars-module')).starsModule,
  name: 'games.stars.name',
  rule: 'games.stars.rule',
  variants: [
    { id: '5', label: 'games.stars.variants.size5' },
    { id: '6', label: 'games.stars.variants.size6' },
    { id: '7', label: 'games.stars.variants.size7' },
    { id: '8', label: 'games.stars.variants.size8' },
    { id: '9', label: 'games.stars.variants.size9' },
    { id: '10', label: 'games.stars.variants.size10' },
    { id: '10-2', label: 'games.stars.variants.size10Double' }
  ]
} as const satisfies GameDefinition
