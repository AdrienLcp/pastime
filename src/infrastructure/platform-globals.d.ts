/*
 * Platform APIs the DOM library does not describe yet. Each is optional and
 * feature-detected where it is used: declaring it is what lets the detection
 * compile without a cast, never a promise that the browser has it.
 */

/** Chrome's install prompt, fired before the browser offers its own. */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt: () => Promise<void>
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

interface Navigator {
  /** Safari on iOS, opened from the home screen. */
  readonly standalone?: boolean
}
