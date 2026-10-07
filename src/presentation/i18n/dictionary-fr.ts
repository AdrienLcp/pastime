import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

/**
 * The reference dictionary: its keys are the type every other locale is held
 * to. French typography puts a no-break space before « : », « ; », « ? ».
 */
export const FR_DICTIONARY = defineDictionary({
  app: {
    name: 'Pastime'
  },
  crash: {
    prose:
      'Une erreur a interrompu l’affichage. Recharger la page remet l’app d’aplomb.',
    reason: 'Motif :',
    reload: 'Recharger la page',
    title: 'Quelque chose s’est mal passé'
  },
  hub: {
    issue: defineTranslation('{day:date}', {
      date: { day: { day: 'numeric', month: 'long', weekday: 'long' } }
    }),
    tagline: 'Des petits jeux en solo. Sans pub, sans compte, même hors ligne.'
  },
  notFound: {
    prose: 'Aucune page ne porte l’adresse {path}.',
    title: 'Page introuvable',
    toHub: 'Retour aux jeux'
  },
  pwa: {
    install: {
      action: 'Installer',
      decline: 'Pas maintenant',
      text: 'Installer Pastime : l’app s’ouvre en plein écran et marche sans réseau.'
    },
    update: {
      action: 'Recharger',
      text: 'Une nouvelle version est prête.'
    }
  },
  theme: {
    dark: 'Sombre',
    label: 'Thème',
    light: 'Clair',
    system: 'Auto'
  }
})
