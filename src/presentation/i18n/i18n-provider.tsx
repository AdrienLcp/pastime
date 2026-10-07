import { createSafeContext } from '@adrienlcp/react'
import type React from 'react'

import { preferredLocales } from '@/infrastructure/browser'
import { I18nProvider as AriaI18nProvider } from '@/presentation/components/i18n-provider'

import { i18n } from './i18n'
import type { Locale } from './locale'
import { REGIONAL_LOCALES } from './regional-locales'
import type { Translate } from './translation'

type I18nContextValue = {
  locale: Locale
  translate: Translate
}

export const [I18nContext, useI18n] =
  createSafeContext<I18nContextValue>('I18nProvider')

export const useTranslate = (): Translate => useI18n().translate

type I18nProviderProps = {
  children: React.ReactNode
  locale: Locale
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  locale
}) => (
  <I18nContext
    value={{ locale, translate: i18n.translator(locale, preferredLocales()) }}
  >
    <AriaI18nProvider locale={REGIONAL_LOCALES[locale]}>
      {children}
    </AriaI18nProvider>
  </I18nContext>
)
