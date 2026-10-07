import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

/**
 * The reference dictionary: its keys are the type every other locale is held
 * to. French typography puts a no-break space before « : », « ; », « ? ».
 */
export const FR_DICTIONARY = defineDictionary({
  app: {
    name: 'Pastime'
  },
  common: {
    backToBook: 'Retour au cahier',
    puzzleNumber: 'N°'
  },
  crash: {
    prose:
      'Une erreur a interrompu l’affichage. Recharger la page remet l’app d’aplomb.',
    reason: 'Motif :',
    reload: 'Recharger la page',
    title: 'Quelque chose s’est mal passé'
  },
  frame: {
    clock: 'Temps',
    daily: 'du jour',
    failed: {
      prose:
        'Le générateur n’a pas trouvé de grille à vous proposer. Un nouvel essai part d’une autre graine.',
      retry: 'Réessayer',
      title: 'Ce puzzle n’a pas pu être imprimé'
    },
    hint: {
      label: 'Indice.',
      none: 'Pas d’indice à donner sur cette grille.'
    },
    pause: 'Pause',
    paused: {
      prose:
        'Le chrono est arrêté, la grille cachée. Elle vous attend telle quelle.',
      resume: 'Reprendre',
      title: 'En pause'
    },
    tools: {
      hint: 'Indice',
      label: 'Outils',
      restart: 'Recommencer',
      undo: 'Annuler'
    },
    win: {
      best: 'Record',
      days: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} jour', other: '{?} jours' } }
      }),
      home: 'Accueil',
      newBest: 'nouveau record !',
      next: defineTranslation('Puzzle suivant · N° {number:number}', {
        number: { number: { useGrouping: false } }
      }),
      nextVariant: 'Taille du suivant',
      replay: 'Rejouer',
      stamp: 'Résolu',
      streak: 'Série',
      time: 'Temps',
      toFreePlay: 'Partie libre'
    }
  },
  games: {
    lights: {
      board: 'Grille Lumières, {size:number} par {size:number}',
      hint: 'Touchez la lampe entourée : elle fait partie du plus court chemin.',
      lamp: 'Ligne {row:number}, colonne {column:number}',
      lit: 'allumée',
      litCount: defineTranslation('{count:plural} sur {total:number}', {
        plural: {
          count: { one: '{?} lampe allumée', other: '{?} lampes allumées' }
        }
      }),
      name: 'Lumières',
      rule: 'Éteignez toutes les lampes. Chacune bascule avec ses voisines.',
      variants: {
        size3: '3×3',
        size4: '4×4'
      }
    }
  },
  hub: {
    chapters: 'Chapitres',
    colophon: 'Hors ligne · sans compte · sans publicité',
    coverMeta: defineTranslation('{count:plural} · record {best}', {
      plural: { count: { one: '{?} résolu', other: '{?} résolus' } }
    }),
    coverNew: 'Pas encore ouvert',
    empty: {
      prose:
        'Le puzzle du jour est le même pour tout le monde. Une partie interrompue vous attendra ici.',
      title: 'Cahier neuf, rien en cours.'
    },
    idle: 'Rien en cours.',
    issue: defineTranslation('Cahier n° {number:number} · {day:date}', {
      date: { day: { day: 'numeric', month: 'long', weekday: 'long' } },
      number: { number: { useGrouping: false } }
    }),
    resume: {
      action: 'Reprendre',
      moves: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} coup', other: '{?} coups' } }
      }),
      title: 'Reprendre'
    },
    settings: 'Réglages',
    start: 'Pour commencer',
    streak: 'Série',
    streakDays: '{count:number} j.',
    today: {
      done: 'fait',
      inProgress: 'en cours',
      title: 'Aujourd’hui',
      todo: 'à faire'
    }
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
  settings: {
    backup: {
      cancel: 'Garder mes données',
      confirm: 'Tout remplacer',
      damaged:
        'Ce fichier vient de Pastime mais il est abîmé : rien n’a été remplacé.',
      export: 'Exporter dans un fichier',
      import: 'Importer un fichier',
      notABackup: 'Ce fichier ne vient pas de Pastime : rien n’a été remplacé.',
      prose:
        'Parties en cours, records et réglages tiennent dans un fichier : gardez-le, ou ouvrez-le sur un autre appareil.',
      replace:
        'Remplacer tout ce que cet appareil garde par le fichier du {day} ?',
      storageRefused:
        'Cet appareil a refusé l’écriture : rien n’a été remplacé.',
      title: 'Vos données',
      unreadable: 'Le fichier n’a pas pu être lu.'
    },
    haptics: {
      label: 'Vibrations',
      prose: 'Un petit tap à chaque coup, sur les téléphones qui vibrent.'
    },
    language: 'Langue',
    languages: {
      en: 'English',
      fr: 'Français'
    },
    sound: {
      label: 'Son',
      prose: 'Coupé tant que vous ne l’allumez pas.'
    },
    title: 'Réglages'
  },
  theme: {
    dark: 'Sombre',
    label: 'Thème',
    light: 'Clair',
    system: 'Auto'
  }
})
