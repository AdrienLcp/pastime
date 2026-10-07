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
    stars: {
      board: 'Grille Étoiles {size:number} par {size:number}',
      cell: 'Ligne {row:number}, colonne {column:number}, région {region:number}',
      conflicts: {
        column: 'trop d’étoiles dans une colonne',
        region: 'trop d’étoiles dans une région',
        row: 'trop d’étoiles sur une ligne',
        touching: 'deux étoiles se touchent'
      },
      hints: {
        columnInRegion:
          'Cette colonne ne peut placer son étoile que dans une région : le reste de la région est vide.',
        columnsInRegions:
          'Ces colonnes ne placent leurs étoiles que dans autant de régions : le reste de ces régions est vide.',
        fullColumn: 'Cette colonne a toutes ses étoiles : le reste est vide.',
        fullRegion: 'Cette région a toutes ses étoiles : le reste est vide.',
        fullRow: 'Cette ligne a toutes ses étoiles : le reste est vide.',
        nextToStar: 'Une case qui touche une étoile reste vide.',
        regionInColumn:
          'Cette région ne tient plus que dans une colonne : le reste de la colonne est vide.',
        regionInRow:
          'Cette région ne tient plus que dans une ligne : le reste de la ligne est vide.',
        regionsInColumns:
          'Ces régions ne tiennent plus que dans autant de colonnes : le reste de ces colonnes est vide.',
        regionsInRows:
          'Ces régions ne tiennent plus que dans autant de lignes : le reste de ces lignes est vide.',
        rowInRegion:
          'Cette ligne ne peut placer son étoile que dans une région : le reste de la région est vide.',
        rowsInRegions:
          'Ces lignes ne placent leurs étoiles que dans autant de régions : le reste de ces régions est vide.',
        singleColumn:
          'Cette colonne n’a plus de place que pour ses étoiles : elles vont dans les cases entourées.',
        singleRegion:
          'Cette région n’a plus de place que pour ses étoiles : elles vont dans les cases entourées.',
        singleRow:
          'Cette ligne n’a plus de place que pour ses étoiles : elles vont dans les cases entourées.',
        touchingColumn:
          'Une étoile ici ne laisserait plus de place à une colonne : la case est vide.',
        touchingRegion:
          'Une étoile ici ne laisserait plus de place à une région : la case est vide.',
        touchingRow:
          'Une étoile ici ne laisserait plus de place à une ligne : la case est vide.',
        wrongCross: 'Cette croix cache une étoile : effacez-la.',
        wrongStar: 'Cette étoile n’est pas à sa place : effacez-la.'
      },
      marks: {
        cross: 'croix',
        ruledOut: 'exclue',
        star: 'étoile'
      },
      name: 'Étoiles',
      rule: 'Une étoile par ligne, colonne et région, sans qu’elles se touchent.',
      starCount: defineTranslation('{count:plural} sur {total:number}', {
        plural: {
          count: { one: '{?} étoile posée', other: '{?} étoiles posées' }
        }
      }),
      variants: {
        size5: '5×5',
        size6: '6×6',
        size7: '7×7',
        size8: '8×8',
        size9: '9×9',
        size10: '10×10',
        size10Double: '10×10 2★'
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
    autoCross: {
      label: 'Croix automatiques',
      prose: 'Les cases qu’une étoile exclut se barrent toutes seules.'
    },
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
