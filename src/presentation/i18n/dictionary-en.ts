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
      newBest: 'new best!',
      next: defineTranslation('Next puzzle · No. {number:number}', {
        number: { number: { useGrouping: false } }
      }),
      nextVariant: 'Next size',
      replay: 'Play again',
      stamp: 'Solved',
      streak: 'Streak',
      time: 'Time',
      toFreePlay: 'Free play'
    }
  },
  games: {
    lights: {
      board: 'Lights grid, {size:number} by {size:number}',
      hint: 'Press the circled lamp: it is part of the shortest way out.',
      lamp: 'Row {row:number}, column {column:number}',
      lit: 'lit',
      litCount: defineTranslation('{count:plural} of {total:number}', {
        plural: { count: { one: '{?} lamp lit', other: '{?} lamps lit' } }
      }),
      name: 'Lights',
      rule: 'Switch every lamp off. Each one flips with its neighbours.',
      variants: {
        size3: '3×3',
        size4: '4×4'
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
