import { AriaRouterProvider } from '@adrienlcp/react-router'
import type React from 'react'
import { useEffect, useRef, ViewTransition } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { AppShell } from '@/presentation/app-shell'
import { focusMain } from '@/presentation/components/main'

/**
 * A client-side navigation leaves focus on the link that started it: the new
 * page is announced by nothing. Focus moves to the new page instead; the first
 * render is a full load, where it starts at the top on its own.
 */
const useFocusMainOnNavigation = (): void => {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return
    }

    previousPathname.current = pathname
    focusMain({ preventScroll: true })
  }, [pathname])
}

export const RootRoute: React.FC = () => {
  const { pathname } = useLocation()
  useFocusMainOnNavigation()

  return (
    <AriaRouterProvider>
      <AppShell>
        <ViewTransition default='none' enter='auto' exit='auto' key={pathname}>
          <Outlet />
        </ViewTransition>
      </AppShell>
      <ScrollRestoration />
    </AriaRouterProvider>
  )
}
