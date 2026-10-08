import type React from 'react'
import { useLocation } from 'react-router'

import { SITE_ORIGIN } from '@/infrastructure/site-origin'
import { isLocale, LOCALES } from '@/presentation/i18n/locale'

const LANGUAGE_SEGMENT = /^\/([^/]+)/

/**
 * The address search engines file the current page under, and the same page
 * in every other language, hoisted by React into the head. Rendered once, by
 * the root route: every page names itself, never the home page.
 */
export const DocumentCanonical: React.FC = () => {
  const { pathname } = useLocation()
  const language = LANGUAGE_SEGMENT.exec(pathname)?.[1]
  const isTranslated = language !== undefined && isLocale(language)

  return (
    <>
      <link href={`${SITE_ORIGIN}${pathname}`} rel='canonical' />
      {isTranslated &&
        LOCALES.map((locale) => (
          <link
            href={`${SITE_ORIGIN}${pathname.replace(LANGUAGE_SEGMENT, `/${locale}`)}`}
            hrefLang={locale}
            key={locale}
            rel='alternate'
          />
        ))}
    </>
  )
}
