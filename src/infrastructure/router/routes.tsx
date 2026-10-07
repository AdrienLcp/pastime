import type { RouteObject } from 'react-router'

import { RouteFallback } from '@/presentation/route-fallback'

import { paths } from './navigation'
import { RootRoute } from './root-route'
import { ErrorScreen, NotFoundPage } from './route-error'

type RoutedPath = (typeof paths)[keyof typeof paths]

/**
 * Keyed by path, so a path with no page, or a page given twice, fails to
 * compile. Every page is lazy: a route downloads only its own feature.
 */
const pageFor = {
  [paths.hub]: async () => ({
    Component: (await import('@/features/hub/hub-page')).HubPage
  })
} satisfies Record<RoutedPath, RouteObject['lazy']>

const routeFor = (path: RoutedPath): RouteObject => ({
  lazy: pageFor[path],
  path
})

/** The tree rather than a router: `main.tsx` builds the browser router over it. */
export const routes: RouteObject[] = [
  {
    Component: RootRoute,
    children: [
      ...Object.values(paths).map(routeFor),
      { Component: NotFoundPage, path: '*' }
    ],
    ErrorBoundary: ErrorScreen,
    HydrateFallback: RouteFallback
  }
]
