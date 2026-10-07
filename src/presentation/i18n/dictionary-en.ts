import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

/** Held to the French reference by the registry. */
export const EN_DICTIONARY = defineDictionary({
  app: {
    name: 'Pastime'
  },
  crash: {
    prose:
      'An error interrupted the page. Reloading it puts the app back on its feet.',
    reason: 'Reason:',
    reload: 'Reload the page',
    title: 'Something went wrong'
  },
  hub: {
    issue: defineTranslation('{day:date}', {
      date: { day: { day: 'numeric', month: 'long', weekday: 'long' } }
    }),
    tagline: 'Small solo games. No ads, no account, even offline.'
  },
  notFound: {
    prose: 'No page lives at {path}.',
    title: 'Page not found',
    toHub: 'Back to the games'
  },
  pwa: {
    install: {
      action: 'Install',
      decline: 'Not now',
      text: 'Install Pastime: it opens full screen and works with no network.'
    },
    update: {
      action: 'Reload',
      text: 'A new version is ready.'
    }
  },
  theme: {
    dark: 'Dark',
    label: 'Theme',
    light: 'Light',
    system: 'Auto'
  }
})
