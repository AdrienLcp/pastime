/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

/*
 * The whole app shell — every script, stylesheet and icon of this build — is
 * cached at install, so a game runs with no network from the first visit on.
 * Every address is the same page: the router draws it, offline included.
 */
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
/* The first visit is served offline from the moment the worker activates, not
   from the next load. A new version still waits for the player's reload. */
clientsClaim()
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))

/** Sent by the page when the player accepts a new version. */
const isSkipWaitingMessage = (data: unknown): boolean =>
  typeof data === 'object' &&
  data !== null &&
  'type' in data &&
  data.type === 'SKIP_WAITING'

self.addEventListener('message', (event) => {
  if (isSkipWaitingMessage(event.data)) {
    void self.skipWaiting()
  }
})
