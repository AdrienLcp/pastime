import type React from 'react'

import { preferredLocales } from '@/infrastructure/browser'
import {
  legalPathFor,
  localeParam,
  useCurrentPath
} from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/link'
import { i18n } from '@/presentation/i18n/i18n'
import { useI18n } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'
import { AUTHOR, SOURCE_REPOSITORY_HREF } from '@/presentation/site-credits'

import './colophon.sass'

/**
 * The shell sits above the language's route, so the address names the
 * language here, and the provider's only for a page outside every language.
 */
const usePageLocale = () => {
  const fallback = useI18n().locale
  return localeParam(useCurrentPath().split('/')[1]) ?? fallback
}

/**
 * The foot of every page, the booklet's imprint: who made it, linked to his
 * site, its source when public, and the legal page the law requires.
 */
export const Colophon: React.FC = () => {
  const locale = usePageLocale()
  const translate = i18n.translator(locale, preferredLocales())

  const authorLink = (children: string): React.ReactNode => (
    <Link className='colophon-link' href={AUTHOR.siteHref[locale]}>
      {children}
    </Link>
  )

  return (
    <footer className='colophon'>
      <p className='colophon-credit'>
        <RichText
          parts={translate.rich('shell.colophon.credit', {
            author: authorLink,
            name: AUTHOR.name
          })}
        />
      </p>
      {SOURCE_REPOSITORY_HREF !== null && (
        <Link className='colophon-link' href={SOURCE_REPOSITORY_HREF}>
          {translate('shell.colophon.source')}
        </Link>
      )}
      <Link className='colophon-link' href={legalPathFor(locale)}>
        {translate('shell.colophon.legal')}
      </Link>
    </footer>
  )
}
