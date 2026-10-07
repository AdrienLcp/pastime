import type React from 'react'
import { useEffect } from 'react'
import { Outlet } from 'react-router'

import { warnOnFailure } from '@/infrastructure/diagnostics'
import { writeStoredLocale } from '@/infrastructure/storage/locale-storage'
import { I18nProvider } from '@/presentation/i18n/i18n-provider'

import { useLocaleParam } from './navigation'
import { NotFoundPage } from './route-error'

/**
 * Every page under its language: the address decides it, `<html lang>`
 * follows, and the device remembers it for the next bare address.
 */
export const LocaleRoute: React.FC = () => {
  const locale = useLocaleParam()

  useEffect(() => {
    if (locale === null) return
    document.documentElement.lang = locale
    warnOnFailure(writeStoredLocale(locale), 'The language could not be saved')
  }, [locale])

  if (locale === null) return <NotFoundPage />

  return (
    <I18nProvider locale={locale}>
      <Outlet />
    </I18nProvider>
  )
}
