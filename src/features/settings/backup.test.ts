import { describe, expect, it } from 'vitest'

import {
  backupFileName,
  gatherBackup,
  parseBackup,
  serializeBackup
} from './backup'

const backup = gatherBackup({
  entries: {
    'pastime.locale': 'fr',
    'pastime.play-record.v1': '{"lights":{}}'
  },
  today: Temporal.PlainDate.from('2026-10-07')
})

describe('backup', () => {
  it('[backup] reads back the file it writes', () => {
    expect(parseBackup(serializeBackup(backup))).toEqual({
      data: backup,
      status: 'success'
    })
  })

  it('[backup] names the file after the day it was written', () => {
    expect(backupFileName(backup)).toBe('pastime-2026-10-07.json')
  })

  it('[backup] refuses a file that is not JSON or not the app’s', () => {
    expect(parseBackup('not json')).toEqual({
      error: 'not_a_backup',
      status: 'failure'
    })
    expect(parseBackup('{"app":"seance","version":1}')).toEqual({
      error: 'not_a_backup',
      status: 'failure'
    })
  })

  it('[backup] calls a file of the app’s with broken entries damaged', () => {
    expect(
      parseBackup(
        '{"app":"pastime","version":1,"entries":{"pastime.locale":3}}'
      )
    ).toEqual({
      error: 'damaged',
      status: 'failure'
    })
  })

  it('[backup] drops a key that is not the app’s', () => {
    const smuggled = serializeBackup({
      ...backup,
      entries: { ...backup.entries, token: 'x' }
    })
    const parsed = parseBackup(smuggled)
    expect(
      parsed.status === 'success' && Object.keys(parsed.data.entries)
    ).toEqual(['pastime.locale', 'pastime.play-record.v1'])
  })
})
