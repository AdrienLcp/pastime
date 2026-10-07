import { describe, expect, it } from 'vitest'

import { clockTimeParts, formatClockTime, isoDuration } from './clock-time'

describe('clock time', () => {
  it('[clock-time] prints minutes and padded seconds, dropping the fraction', () => {
    expect(formatClockTime(0)).toBe('0:00')
    expect(formatClockTime(42_900)).toBe('0:42')
    expect(formatClockTime(192_000)).toBe('3:12')
  })

  it('[clock-time] prints the hours only past one hour', () => {
    expect(formatClockTime(3_849_000)).toBe('1:04:09')
  })

  it('[clock-time] splits a time into whole minutes and seconds', () => {
    expect(clockTimeParts(3_849_000)).toEqual({ minutes: 64, seconds: 9 })
  })

  it('[clock-time] writes the ISO duration a <time> element carries', () => {
    expect(isoDuration(192_400)).toBe('PT3M12S')
  })
})
