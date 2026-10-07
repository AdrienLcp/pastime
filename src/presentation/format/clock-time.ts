/** A puzzle's time as a clock prints it: `0:42`, `3:12`, `1:04:09`. */
export const formatClockTime = (elapsedMs: number): string => {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`
}

/** The same time in whole minutes and seconds. */
export const clockTimeParts = (
  elapsedMs: number
): { minutes: number; seconds: number } => {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000)
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 }
}

/** The machine-readable form a `<time>` carries: `PT3M12S`. */
export const isoDuration = (elapsedMs: number): string => {
  const { minutes, seconds } = clockTimeParts(elapsedMs)
  return `PT${minutes}M${seconds}S`
}
