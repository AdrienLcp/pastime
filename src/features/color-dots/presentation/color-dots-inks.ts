import type { PlainTranslationKey } from '@/presentation/i18n/translation'

/** How each colour is printed and named: its ink, and the symbol it wears. */
export type DotInk = {
  /** The process ink, a token from `_tokens.sass`. */
  readonly ink: `--${string}`
  /** What the symbol is printed in on a ball of this ink. */
  readonly onInk: `--${string}`
  readonly symbol: DotSymbol
  readonly name: PlainTranslationKey
}

export type DotSymbol = 'cross' | 'diamond' | 'dot' | 'square' | 'triangle'

/** Indexed by the level's colour numbers. */
export const DOT_INKS: readonly [DotInk, ...DotInk[]] = [
  {
    ink: '--cyan',
    name: 'games.colorDots.inks.cyan',
    onInk: '--cover-ink',
    symbol: 'dot'
  },
  {
    ink: '--magenta',
    name: 'games.colorDots.inks.magenta',
    onInk: '--cover-ink',
    symbol: 'triangle'
  },
  {
    ink: '--yellow',
    name: 'games.colorDots.inks.yellow',
    onInk: '--cover-ink',
    symbol: 'square'
  },
  {
    ink: '--green',
    name: 'games.colorDots.inks.green',
    onInk: '--cover-ink',
    symbol: 'cross'
  },
  {
    ink: '--ink',
    name: 'games.colorDots.inks.black',
    onInk: '--paper',
    symbol: 'diamond'
  }
]

export const inkOf = (colour: number): DotInk => DOT_INKS[colour] ?? DOT_INKS[0]
