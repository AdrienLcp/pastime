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
    backToGames: 'Retour aux jeux',
    games: 'Jeux'
  },
  crash: {
    prose:
      'Une erreur a interrompu l’affichage. Recharger la page remet l’app d’aplomb.',
    reason: 'Motif :',
    reload: 'Recharger la page',
    title: 'Quelque chose s’est mal passé'
  },
  frame: {
    choose: {
      new: 'Nouvelle partie',
      play: 'Jouer',
      resume: 'Reprendre la partie',
      waiting: '{variant} · {time}'
    },
    clock: 'Temps',
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
    lost: {
      label: 'Bloquée.',
      prose: 'Annulez le dernier coup, ou recommencez.'
    },
    pause: 'Pause',
    paused: {
      prose:
        'Le chrono est arrêté, la grille cachée. Elle vous attend telle quelle.',
      resume: 'Reprendre',
      title: 'En pause'
    },
    score: {
      label: 'Points',
      points: '{points:number}',
      unit: 'pts'
    },
    tools: {
      hint: 'Indice',
      label: 'Outils',
      newLevel: 'Nouvelle partie',
      newLevelConfirm: 'Abandonner ?',
      restart: 'Recommencer',
      undo: 'Annuler'
    },
    win: {
      best: 'Record',
      home: 'Accueil',
      moves: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} coup', other: '{?} coups' } }
      }),
      newBest: 'nouveau record !',
      next: 'Nouvelle partie',
      points: '{points:number}',
      replay: 'Rejouer',
      score: 'Points',
      stamp: 'Résolu',
      time: 'Temps',
      timeBonus: 'dont {bonus:number} de bonus temps'
    }
  },
  games: {
    colorDots: {
      ball: 'Bille {ink}, ligne {row:number}, colonne {column:number}',
      ballCount: defineTranslation('{count:plural} à placer', {
        plural: { count: { one: '{?} bille', other: '{?} billes' } }
      }),
      board: 'Plateau Color Dots',
      hints: {
        deadEnd:
          'Plus aucun ordre ne vide le plateau d’ici : un coup précédent l’a scellé. Annulez-le.',
        nextBall:
          'Cette bille peut partir maintenant sans rien bloquer : envoyez-la.'
      },
      inks: {
        black: 'noire au losange',
        cyan: 'cyan au rond',
        green: 'verte à la croix',
        magenta: 'magenta au triangle',
        yellow: 'jaune au carré'
      },
      name: 'Color Dots',
      rule: 'Chaque bille rejoint son anneau. L’ordre est tout.',
      variantChoice: 'Difficulté',
      variants: {
        easy: 'Facile',
        expert: 'Expert',
        hard: 'Difficile'
      }
    },
    pipes: {
      board: 'Grille Tuyaux {size:number} par {size:number}',
      direction: {
        back: 'Sens inverse',
        clockwise: 'Sens horaire'
      },
      dry: 'à sec',
      hints: {
        forced:
          'Cette pièce ne peut plus tenir que d’une façon : tournez-la, puis verrouillez-la d’un appui long.',
        wrongLock:
          'Cette pièce est verrouillée dans le mauvais sens : déverrouillez-la d’un appui long.'
      },
      locked: 'verrouillée',
      name: 'Tuyaux',
      opens: 'ouverte vers {sides}',
      rule: 'Tournez les pièces : l’eau doit tout irriguer, sans boucle ni fuite.',
      sides: {
        east: 'l’est',
        north: 'le nord',
        south: 'le sud',
        west: 'l’ouest'
      },
      source: 'source',
      tile: 'Ligne {row:number}, colonne {column:number}',
      variantChoice: 'Taille',
      variants: {
        size5: '5×5',
        size7: '7×7',
        size9: '9×9',
        size11: '11×11',
        size13: '13×13'
      },
      waterCount: defineTranslation(
        '{count:plural} sur {total:number} en eau',
        {
          plural: { count: { one: '{?} pièce', other: '{?} pièces' } }
        }
      ),
      wet: 'en eau'
    },
    solitaire: {
      board: 'Table de solitaire',
      card: '{rank} de {suit}',
      cardCount: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} carte', other: '{?} cartes' } }
      }),
      empty: 'vide',
      finish: 'Tout ranger',
      hiddenCount: defineTranslation('{count:plural}', {
        plural: {
          count: { one: '{?} carte cachée', other: '{?} cartes cachées' }
        }
      }),
      hints: {
        draw: 'Rien à jouer sur la table : retournez une carte de la pioche.',
        recycle:
          'La pioche est vide : retournez la défausse pour la reprendre.',
        toColumn: 'Ces cartes peuvent descendre sur la pile marquée.',
        toFoundation: 'Cette carte peut monter sur sa fondation.'
      },
      name: 'Solitaire',
      newDeal: 'Nouvelle donne',
      piles: {
        column: 'Colonne {column:number}',
        foundation: 'Fondation {suit}',
        stock: 'Pioche',
        waste: 'Défausse'
      },
      rankMarks: {
        ace: 'A',
        jack: 'V',
        king: 'R',
        queen: 'D'
      },
      ranks: {
        ace: 'As',
        jack: 'Valet',
        king: 'Roi',
        queen: 'Dame'
      },
      recycle: 'retourner la défausse',
      rule: 'Rangez les quatre couleurs de l’as au roi, en descendant les colonnes rouge sur noir.',
      suits: {
        clubs: 'trèfle',
        diamonds: 'carreau',
        hearts: 'cœur',
        spades: 'pique'
      },
      variantChoice: 'Donne',
      variantNotes: {
        random: 'Mélangée sans vérification : parfois perdue d’avance.',
        winnable: 'Le solveur a vérifié qu’elle se gagne.'
      },
      variants: {
        random: 'Au hasard',
        winnable: 'Gagnable'
      }
    },
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
      variantChoice: 'Taille',
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
    coverMeta: defineTranslation('{count:plural} · record {best}', {
      plural: { count: { one: '{?} résolu', other: '{?} résolus' } }
    }),
    settings: 'Réglages'
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
