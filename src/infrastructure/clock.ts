/** Epoch milliseconds, the one read of the wall clock. */
export const nowMs = (): number => Date.now()

/**
 * The current moment in the device's time zone. Read through `Date.now()`,
 * which fake timers move, unlike `Temporal.Now`.
 */
export const zonedNow = (): Temporal.ZonedDateTime =>
  Temporal.Instant.fromEpochMilliseconds(nowMs()).toZonedDateTimeISO(
    Temporal.Now.timeZoneId()
  )

/** The device's calendar day: the one a backup file is named by. */
export const today = (): Temporal.PlainDate => zonedNow().toPlainDate()

/**
 * A count that only moves forward, for the time a puzzle takes: unlike the
 * wall clock, a phone setting its time mid-game cannot add or remove minutes.
 */
export const elapsedClockMs = (): number => performance.now()
