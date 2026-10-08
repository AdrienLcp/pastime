import {
  generatePath,
  isRouteErrorResponse,
  type PathParam,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useRevalidator,
  useRouteError
} from 'react-router'

import { isLocale, type Locale } from '@/presentation/i18n/locale'

/** Every address the app answers. The language leads every one of them. */
export const paths = {
  game: '/:locale/:game',
  hub: '/:locale',
  settings: '/:locale/settings'
} as const

/**
 * Where a game was played while its own address opened a choice first; an
 * installed app may still hold it, so it leads to the game.
 */
export const retiredPlayPath = '/:locale/:game/play'

const pathFor = <Path extends string>(
  path: Path,
  params: Record<PathParam<Path>, string>
): string => generatePath<string>(path, params)

export const hubPathFor = (locale: Locale): string =>
  pathFor(paths.hub, { locale })

export const settingsPathFor = (locale: Locale): string =>
  pathFor(paths.settings, { locale })

export const gamePathFor = ({
  gameId,
  locale
}: {
  gameId: string
  locale: Locale
}): string => pathFor(paths.game, { game: gameId, locale })

/** The language the address is in; `null` for a segment that is not one. */
export const localeParam = (raw: string | undefined): Locale | null =>
  raw !== undefined && isLocale(raw) ? raw : null

export const useLocaleParam = (): Locale | null =>
  localeParam(useParams<PathParam<typeof paths.hub>>().locale)

/** The address the player asked for, as the router matched it. */
export const useCurrentPath = (): string => useLocation().pathname

/**
 * The same page in another language: the address with its first segment
 * swapped, so a switch keeps the player where they are.
 */
export const useCurrentPathIn = (): ((locale: Locale) => string) => {
  const { pathname } = useLocation()
  return (locale) => pathname.replace(/^\/[^/]+/, `/${locale}`)
}

/**
 * What a route's loader resolved; each feature pairs it with its own hook,
 * typed with the resolved value — `useRouteData<GameLoaderData>()` — never the
 * loader: react-router reads a loader's type as a server's and strips the
 * functions a client loader hands over.
 */
export { useLoaderData as useRouteData }

/** Swaps the address after an action, not on a link: a language switched. */
export const useReplacePage = (): ((path: string) => void) => {
  const navigate = useNavigate()
  return (path) => {
    void navigate(path, { replace: true })
  }
}

/** Runs the page's loader again in place: a new puzzle on the same address. */
export const useReloadRouteData = (): (() => void) => {
  const revalidator = useRevalidator()
  return () => {
    void revalidator.revalidate()
  }
}

/** What broke, in one line: shown to the player so it can be reported. */
export const useRouteFailure = (): string => {
  const error = useRouteError()
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`.trim()
  }
  return error instanceof Error ? error.message : String(error)
}
