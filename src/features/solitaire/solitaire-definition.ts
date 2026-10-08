import type { GameDefinition } from '@/features/game-frame/game-definition'

import { SolitaireGlyph } from './presentation/solitaire-glyph'

export const solitaireDefinition = {
  chapterInk: '--chapter-solitaire',
  countsMoves: true,
  Glyph: SolitaireGlyph,
  id: 'solitaire',
  load: async () => (await import('./solitaire-module')).solitaireModule,
  name: 'games.solitaire.name',
  rule: 'games.solitaire.rule',
  variantChoice: 'games.solitaire.variantChoice',
  variants: [
    {
      id: 'winnable',
      label: 'games.solitaire.variants.winnable',
      note: 'games.solitaire.variantNotes.winnable'
    },
    {
      id: 'random',
      label: 'games.solitaire.variants.random',
      note: 'games.solitaire.variantNotes.random'
    }
  ]
} as const satisfies GameDefinition
