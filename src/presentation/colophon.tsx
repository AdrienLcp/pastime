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

import './colophon.sass'

/**
 * The shell sits above the language's route, so the address names the
 * language here, and the provider's only for a page outside every language.
 */
const usePageLocale = () => {
  const fallback = useI18n().locale
  return localeParam(useCurrentPath().split('/')[1]) ?? fallback
}

/** The foot of every page: the booklet's imprint, linking to the legal page the law requires. */
export const Colophon: React.FC = () => {
  const locale = usePageLocale()
  const translate = i18n.translator(locale, preferredLocales())

  return (
    <footer className='colophon'>
      <Link className='colophon-link' href={legalPathFor(locale)}>
        {translate('shell.colophon.legal')}
      </Link>
    </footer>
  )
}
