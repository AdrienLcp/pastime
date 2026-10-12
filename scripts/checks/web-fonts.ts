import type { Browser, Locator, Page } from '@playwright/test'

import { openCheckPage } from './muted-browser.ts'

export type TextWidths = {
  fallback: number
  webFont: number
}

/**
 * Waits for the faces the element is set in. `document.fonts.ready` resolves
 * as soon as nothing is loading, before a face the page has not asked for yet.
 * Rejects when a face fails to load, so never call it on a page whose web
 * fonts are blocked.
 */
export const loadFontsOf = (element: Locator): Promise<void> =>
  element.evaluate(async (node) => {
    const style = getComputedStyle(node)

    await document.fonts.load(
      `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
      node.textContent ?? undefined
    )
    await document.fonts.ready
  })

const textWidthOf = (element: Locator): Promise<number> =>
  element.evaluate((node) => {
    const range = document.createRange()
    range.selectNodeContents(node)

    return range.getBoundingClientRect().width
  })

/**
 * Turns every `@font-face` of the page to `font-display: block`. Under
 * `optional`, a face that missed the first paint stays out for the page's
 * whole life, and `vite preview` answers `no-cache`, so even a reload
 * revalidates the file for longer than `optional` waits.
 */
const blockOnWebFonts = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const blockOn = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSFontFaceRule) {
          rule.style.setProperty('font-display', 'block')
        } else if (rule instanceof CSSGroupingRule) {
          blockOn(rule.cssRules)
        }
      }
    }

    for (const sheet of document.styleSheets) {
      blockOn(sheet.cssRules)
    }
  })

const openWithWebFonts = async (page: Page, url: string, selector: string) => {
  await page.goto(url)
  await blockOnWebFonts(page)
  await loadFontsOf(page.locator(selector))
}

/**
 * The width of an element's text in its web font and in its metric-matched
 * fallback face — equal when the fallback is tuned, so nothing moves when the
 * font lands.
 */
export const measureTextWidths = async (
  browser: Browser,
  url: string,
  selector: string
): Promise<TextWidths> => {
  const withWebFonts = await openCheckPage(browser)
  const withFallbacks = await openCheckPage(browser, { blockWebFonts: true })

  try {
    await openWithWebFonts(withWebFonts, url, selector)
    await withFallbacks.goto(url)
    await withFallbacks.evaluate(() => document.fonts.ready)

    return {
      fallback: await textWidthOf(withFallbacks.locator(selector)),
      webFont: await textWidthOf(withWebFonts.locator(selector))
    }
  } finally {
    await withWebFonts.context().close()
    await withFallbacks.context().close()
  }
}
