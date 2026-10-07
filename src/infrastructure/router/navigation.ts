import { isRouteErrorResponse, useLocation, useRouteError } from 'react-router'

/** Every address the app answers; a path with no param is already a whole URL. */
export const paths = {
  hub: '/'
} as const

/** The address the player asked for, as the router matched it. */
export const useCurrentPath = (): string => useLocation().pathname

/** What broke, in one line: shown to the player so it can be reported. */
export const useRouteFailure = (): string => {
  const error = useRouteError()
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`.trim()
  }
  return error instanceof Error ? error.message : String(error)
}
