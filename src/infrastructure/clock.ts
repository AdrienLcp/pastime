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

/** The device's calendar day: the daily puzzle's day. */
export const today = (): Temporal.PlainDate => zonedNow().toPlainDate()
