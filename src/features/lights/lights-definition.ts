import type { GameDefinition } from '@/features/game-frame/game-definition'

import { LightsGlyph } from './presentation/lights-glyph'

/**
 * The frame's placeholder: a game small enough to prove the hub, the frame,
 * the saves and the worker before a real one is written. It leaves the
 * registry when Stars arrives.
 */
export const lightsDefinition = {
  chapterInk: '--chapter-lights',
  dailyVariant: '4',
  Glyph: LightsGlyph,
  id: 'lights',
  load: async () => (await import('./lights-module')).lightsModule,
  name: 'games.lights.name',
  rule: 'games.lights.rule',
  variants: [
    { id: '3', label: 'games.lights.variants.size3' },
    { id: '4', label: 'games.lights.variants.size4' }
  ]
} as const satisfies GameDefinition
