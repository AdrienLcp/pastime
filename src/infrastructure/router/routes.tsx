import { type LoaderFunction, type RouteObject, redirect } from 'react-router'

import { gameLoader } from '@/features/game-frame/game-loader'
import { initialLocale } from '@/presentation/i18n/initial-locale'
import { RouteFallback } from '@/presentation/route-fallback'

import { LocaleRoute } from './locale-route'
import { hubPathFor, paths } from './navigation'
import { RootRoute } from './root-route'
import { ErrorScreen, NotFoundPage } from './route-error'

type RoutedPath = (typeof paths)[keyof typeof paths]

/**
 * Keyed by path, so a path with no page, or a page given twice, fails to
 * compile. Every page is lazy: a route downloads only its own feature.
 */
const pageFor = {
  [paths.daily]: async () => ({
    Component: (await import('@/features/game-frame/presentation/game-page'))
      .GamePage
  }),
  [paths.game]: async () => ({
    Component: (await import('@/features/game-frame/presentation/game-page'))
      .GamePage
  }),
  [paths.hub]: async () => ({
    Component: (await import('@/features/hub/hub-page')).HubPage
  }),
  [paths.settings]: async () => ({
    Component: (await import('@/features/settings/settings-page')).SettingsPage
  })
} satisfies Record<RoutedPath, RouteObject['lazy']>

/** Only this file reads URL params: a loader is handed plain values. */
const loaderFor: Partial<Record<RoutedPath, LoaderFunction>> = {
  [paths.daily]: ({ params, request }) =>
    gameLoader({
      gameId: params.game ?? '',
      mode: 'daily',
      signal: request.signal
    }),
  [paths.game]: ({ params, request }) =>
    gameLoader({
      gameId: params.game ?? '',
      mode: 'free',
      signal: request.signal
    })
}

const localizedPaths = Object.values(paths).filter((path) => path !== paths.hub)

/** The tree rather than a router: `main.tsx` builds the browser router over it. */
export const routes: RouteObject[] = [
  {
    Component: RootRoute,
    children: [
      {
        Component: RouteFallback,
        loader: () => redirect(hubPathFor(initialLocale())),
        path: '/'
      },
      {
        Component: LocaleRoute,
        children: [
          { index: true, lazy: pageFor[paths.hub] },
          ...localizedPaths.map(
            (path): RouteObject => ({
              lazy: pageFor[path],
              loader: loaderFor[path],
              path
            })
          )
        ],
        path: paths.hub
      },
      { Component: NotFoundPage, path: '*' }
    ],
    ErrorBoundary: ErrorScreen,
    HydrateFallback: RouteFallback
  }
]
