import type { GameDefinition } from '@/features/game-frame/game-definition'

import {
  BOSS_VARIANT,
  NUMBERED_VARIANT
} from './generator/color-dots-progression'
import { ColorDotsGlyph } from './presentation/color-dots-glyph'

export const colorDotsDefinition = {
  chapterInk: '--chapter-color-dots',
  countsMoves: false,
  dailyOnlyVariant: {
    id: BOSS_VARIANT,
    label: 'games.colorDots.variants.boss'
  },
  dailyVariant: BOSS_VARIANT,
  Glyph: ColorDotsGlyph,
  id: 'color-dots',
  load: async () => (await import('./color-dots-module')).colorDotsModule,
  name: 'games.colorDots.name',
  rule: 'games.colorDots.rule',
  variants: [
    { id: NUMBERED_VARIANT, label: 'games.colorDots.variants.numbered' }
  ]
} as const satisfies GameDefinition
