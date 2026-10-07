import type { FailureResult } from '@adrienlcp/result'

/**
 * Tells the developer console that `what` went wrong and why, when `outcome`
 * failed; a success says nothing. The one place the app writes to the console,
 * for failures the player is not shown because the app carries on without them.
 *
 * @param what The sentence that names the failure, without the final period.
 */
export const warnOnFailure = (
  outcome: { status: 'success' } | FailureResult<string>,
  what: string
): void => {
  if (outcome.status === 'failure') console.warn(`${what} (${outcome.error}).`)
}
