/**
 * The local faces drawn to Arial's metrics: fontaine scales its fallback face
 * to Arial alone, which Linux lacks and Android replaces with Roboto, so the
 * fallback would fail to load there and the swap would move every line.
 */
const ARIAL_METRIC_TWINS = ['Arial', 'Liberation Sans', 'Arimo', 'Roboto']

const ARIAL_ONLY_SOURCE = 'local("Arial")'

const FALLBACK_FAMILY_SUFFIX = ' fallback'

type Declaration = { prop: string; value: string }

type FontFaceRule = {
  walkDecls: (callback: (declaration: Declaration) => void) => void
}

type StyleRoot = {
  walkAtRules: (name: string, callback: (rule: FontFaceRule) => void) => void
}

const isFallbackFace = (rule: FontFaceRule): boolean => {
  let isFallback = false
  rule.walkDecls((declaration) => {
    if (declaration.prop !== 'font-family') return
    const family = declaration.value.replaceAll(/["']/g, '')
    isFallback = family.endsWith(FALLBACK_FAMILY_SUFFIX)
  })
  return isFallback
}

/**
 * A PostCSS plugin, run after `fontaine/postcss`: widens the `src` of each
 * fallback face fontaine wrote from Arial to Arial's metric twins.
 */
export const arialMetricTwins = {
  OnceExit: (root: StyleRoot): void => {
    root.walkAtRules('font-face', (rule) => {
      if (!isFallbackFace(rule)) return
      rule.walkDecls((declaration) => {
        if (declaration.prop !== 'src') return
        if (declaration.value !== ARIAL_ONLY_SOURCE) return
        declaration.value = ARIAL_METRIC_TWINS.map(
          (face) => `local("${face}")`
        ).join(', ')
      })
    })
  },
  postcssPlugin: 'arial-metric-twins'
}
