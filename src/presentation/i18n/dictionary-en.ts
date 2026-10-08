import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

/** Held to the French reference by the registry. */
export const EN_DICTIONARY = defineDictionary({
  app: {
    name: 'Pastime'
  },
  common: {
    backToBook: 'Back to the book',
    puzzleNumber: 'No.'
  },
  crash: {
    prose:
      'An error interrupted the page. Reloading it puts the app back on its feet.',
    reason: 'Reason:',
    reload: 'Reload the page',
    title: 'Something went wrong'
  },
  frame: {
    clock: 'Time',
    daily: 'daily',
    failed: {
      prose:
        'The generator found no grid to give you. Another try starts from another seed.',
      retry: 'Try again',
      title: 'This puzzle could not be printed'
    },
    hint: {
      label: 'Hint.',
      none: 'No hint to give on this grid.'
    },
    lost: {
      label: 'Blocked.',
      prose: 'Undo the last tap, or start again.'
    },
    pause: 'Pause',
    paused: {
      prose:
        'The clock is stopped and the grid hidden. It waits for you as it was.',
      resume: 'Resume',
      title: 'Paused'
    },
    tools: {
      hint: 'Hint',
      label: 'Tools',
      restart: 'Restart',
      undo: 'Undo'
    },
    win: {
      best: 'Best',
      days: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} day', other: '{?} days' } }
      }),
      home: 'Home',
      moves: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} move', other: '{?} moves' } }
      }),
      newBest: 'new best!',
      next: defineTranslation('Next puzzle · No. {number:number}', {
        number: { number: { useGrouping: false } }
      }),
      nextVariant: 'Next one',
      replay: 'Play again',
      stamp: 'Solved',
      streak: 'Streak',
      time: 'Time',
      toFreePlay: 'Free play'
    }
  },
  games: {
    colorDots: {
      ball: '{ink} ball, row {row:number}, column {column:number}',
      ballCount: defineTranslation('{count:plural} to place', {
        plural: { count: { one: '{?} ball', other: '{?} balls' } }
      }),
      board: 'Color Dots board',
      hints: {
        deadEnd:
          'No order clears the board from here: an earlier tap sealed it. Undo it.',
        nextBall: 'This ball can go now without blocking anything: send it.'
      },
      inks: {
        black: 'Black diamond',
        cyan: 'Cyan dot',
        green: 'Green cross',
        magenta: 'Magenta triangle',
        yellow: 'Yellow square'
      },
      name: 'Color Dots',
      rule: 'Every ball finds its ring. The order is everything.',
      variants: {
        easy: 'Easy',
        expert: 'Expert',
        hard: 'Hard'
      }
    },
    pipes: {
      board: 'Pipes grid, {size:number} by {size:number}',
      direction: {
        back: 'Anticlockwise',
        clockwise: 'Clockwise'
      },
      dry: 'dry',
      hints: {
        forced:
          'This tile can only sit one way now: turn it, then lock it with a long press.',
        wrongLock:
          'This tile is locked the wrong way round: unlock it with a long press.'
      },
      locked: 'locked',
      name: 'Pipes',
      opens: 'open to the {sides}',
      rule: 'Turn the tiles until water reaches them all, with no loop and no leak.',
      sides: {
        east: 'east',
        north: 'north',
        south: 'south',
        west: 'west'
      },
      source: 'source',
      tile: 'Row {row:number}, column {column:number}',
      variants: {
        size5: '5×5',
        size7: '7×7',
        size9: '9×9',
        size11: '11×11',
        size13: '13×13'
      },
      waterCount: defineTranslation('{count:plural} of {total:number} wet', {
        plural: { count: { one: '{?} tile', other: '{?} tiles' } }
      }),
      wet: 'wet'
    },
    solitaire: {
      board: 'Solitaire table',
      card: '{rank} of {suit}',
      cardCount: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} card', other: '{?} cards' } }
      }),
      empty: 'empty',
      finish: 'Finish',
      hiddenCount: defineTranslation('{count:plural}', {
        plural: {
          count: { one: '{?} card face down', other: '{?} cards face down' }
        }
      }),
      hints: {
        draw: 'Nothing to play on the table: turn a card over from the stock.',
        recycle:
          'The stock is out: turn the waste over to go through it again.',
        toColumn: 'These cards can go down onto the marked pile.',
        toFoundation: 'This card can go up to its foundation.'
      },
      homeCount: defineTranslation('{count:plural} of {total:number}', {
        plural: { count: { one: '{?} card home', other: '{?} cards home' } }
      }),
      name: 'Solitaire',
      piles: {
        column: 'Column {column:number}',
        foundation: '{suit} foundation',
        stock: 'Stock',
        waste: 'Waste'
      },
      rankMarks: {
        ace: 'A',
        jack: 'J',
        king: 'K',
        queen: 'Q'
      },
      ranks: {
        ace: 'Ace',
        jack: 'Jack',
        king: 'King',
        queen: 'Queen'
      },
      recycle: 'turn the waste over',
      rule: 'Build the four suits from ace to king, laying the columns down red on black.',
      suits: {
        clubs: 'clubs',
        diamonds: 'diamonds',
        hearts: 'hearts',
        spades: 'spades'
      },
      variants: {
        random: 'Random',
        winnable: 'Winnable'
      }
    },
    stars: {
      board: 'Stars grid, {size:number} by {size:number}',
      cell: 'Row {row:number}, column {column:number}, region {region:number}',
      conflicts: {
        column: 'too many stars in a column',
        region: 'too many stars in a region',
        row: 'too many stars in a row',
        touching: 'two stars touch'
      },
      hints: {
        columnInRegion:
          'This column can only place its star in one region: the rest of that region is empty.',
        columnsInRegions:
          'These columns can only place their stars in as many regions: the rest of those regions is empty.',
        fullColumn: 'This column has all its stars: the rest is empty.',
        fullRegion: 'This region has all its stars: the rest is empty.',
        fullRow: 'This row has all its stars: the rest is empty.',
        nextToStar: 'A cell touching a star stays empty.',
        regionInColumn:
          'This region only fits in one column now: the rest of that column is empty.',
        regionInRow:
          'This region only fits in one row now: the rest of that row is empty.',
        regionsInColumns:
          'These regions only fit in as many columns: the rest of those columns is empty.',
        regionsInRows:
          'These regions only fit in as many rows: the rest of those rows is empty.',
        rowInRegion:
          'This row can only place its star in one region: the rest of that region is empty.',
        rowsInRegions:
          'These rows can only place their stars in as many regions: the rest of those regions is empty.',
        singleColumn:
          'This column only has room left for its stars: they go in the circled cells.',
        singleRegion:
          'This region only has room left for its stars: they go in the circled cells.',
        singleRow:
          'This row only has room left for its stars: they go in the circled cells.',
        touchingColumn:
          'A star here would leave a column no room: the cell is empty.',
        touchingRegion:
          'A star here would leave a region no room: the cell is empty.',
        touchingRow:
          'A star here would leave a row no room: the cell is empty.',
        wrongCross: 'This cross hides a star: rub it out.',
        wrongStar: 'This star is in the wrong place: rub it out.'
      },
      marks: {
        cross: 'cross',
        ruledOut: 'ruled out',
        star: 'star'
      },
      name: 'Stars',
      rule: 'One star in every row, column and region, none touching.',
      starCount: defineTranslation('{count:plural} of {total:number}', {
        plural: { count: { one: '{?} star placed', other: '{?} stars placed' } }
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
    chapters: 'Chapters',
    colophon: 'Offline · no account · no ads',
    coverMeta: defineTranslation('{count:plural} · best {best}', {
      plural: { count: { one: '{?} solved', other: '{?} solved' } }
    }),
    coverNew: 'Not opened yet',
    empty: {
      prose:
        'The daily puzzle is the same for everyone. A game you leave will wait for you here.',
      title: 'A fresh book, nothing under way.'
    },
    idle: 'Nothing under way.',
    issue: defineTranslation('Issue {number:number} · {day:date}', {
      date: { day: { day: 'numeric', month: 'long', weekday: 'long' } },
      number: { number: { useGrouping: false } }
    }),
    resume: {
      action: 'Resume',
      moves: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} move', other: '{?} moves' } }
      }),
      title: 'Resume'
    },
    settings: 'Settings',
    start: 'To begin',
    streak: 'Streak',
    streakDays: '{count:number} d.',
    today: {
      done: 'done',
      inProgress: 'under way',
      title: 'Today',
      todo: 'to do'
    }
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
  settings: {
    autoCross: {
      label: 'Automatic crosses',
      prose: 'The cells a star rules out cross themselves.'
    },
    backup: {
      cancel: 'Keep my data',
      confirm: 'Replace everything',
      damaged:
        'This file comes from Pastime but is damaged: nothing was replaced.',
      export: 'Export to a file',
      import: 'Import a file',
      notABackup: 'This file does not come from Pastime: nothing was replaced.',
      prose:
        'Games under way, best times and settings fit in one file: keep it, or open it on another device.',
      replace: 'Replace everything this device keeps with the file from {day}?',
      storageRefused: 'This device refused the write: nothing was replaced.',
      title: 'Your data',
      unreadable: 'The file could not be read.'
    },
    haptics: {
      label: 'Vibration',
      prose: 'A light tap on every move, on phones that vibrate.'
    },
    language: 'Language',
    languages: {
      en: 'English',
      fr: 'Français'
    },
    sound: {
      label: 'Sound',
      prose: 'Off until you turn it on.'
    },
    title: 'Settings'
  },
  theme: {
    dark: 'Dark',
    label: 'Theme',
    light: 'Light',
    system: 'Auto'
  }
})
