import type { GameDefinition } from '@/features/game-frame/game-definition'

import { SolitaireGlyph } from './presentation/solitaire-glyph'

export const solitaireDefinition = {
  chapterInk: '--chapter-solitaire',
  countsMoves: true,
  dailyVariant: 'winnable',
  Glyph: SolitaireGlyph,
  id: 'solitaire',
  load: async () => (await import('./solitaire-module')).solitaireModule,
  name: 'games.solitaire.name',
  rule: 'games.solitaire.rule',
  variants: [
    { id: 'winnable', label: 'games.solitaire.variants.winnable' },
    { id: 'random', label: 'games.solitaire.variants.random' }
  ]
} as const satisfies GameDefinition
