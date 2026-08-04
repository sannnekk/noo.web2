import {
  getCurrentScope,
  onScopeDispose,
  shallowRef,
  type ShallowRef
} from 'vue'
import type { RequestProgress } from '../api/api.utils'

interface UseLoadingProgressOptions {
  /**
   * Where the guessed progress stops and waits for the work to actually
   * finish. Anything that reaches 100% before the page appears is a lie the
   * user gets to watch.
   */
  ceiling?: number
  /** How often the guess moves, in milliseconds. */
  tickMs?: number
  /**
   * Share of the distance left to the ceiling covered per tick. Progress is
   * therefore fast at first and slows down, which is how a transfer of unknown
   * length is honestly described: something is happening, how much is left is
   * unknown.
   */
  step?: number
}

interface UseLoadingProgressReturn {
  /** Current progress, 0 to 100. */
  progress: ShallowRef<number>
  isRunning: ShallowRef<boolean>
  /** Starts from zero and begins guessing. */
  start: () => void
  /**
   * Feeds real transfer progress. From the first measurable event on, the
   * guess steps aside and the numbers come from the wire.
   */
  report: (event: RequestProgress) => void
  /** Completes the run: 100%, and no more guessing. */
  finish: () => void
  /** Stops and returns to zero without passing through 100%. */
  reset: () => void
}

const DEFAULT_CEILING = 90
const DEFAULT_TICK_MS = 200
const DEFAULT_STEP = 0.15

/**
 * Drives a progress value for work whose length is not known in advance.
 *
 * Not tied to any particular request or component: hand it real progress if
 * there is any, otherwise let it guess, and call `finish()` when the work is
 * done. See `useGlobalUIStore().withLoader()` for the ready-made wiring to the
 * fullscreen loader.
 */
function useLoadingProgress(
  options: UseLoadingProgressOptions = {}
): UseLoadingProgressReturn {
  const {
    ceiling = DEFAULT_CEILING,
    tickMs = DEFAULT_TICK_MS,
    step = DEFAULT_STEP
  } = options

  const progress = shallowRef(0)
  const isRunning = shallowRef(false)

  let timer: ReturnType<typeof setInterval> | null = null

  function stopTimer(): void {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function advance(): void {
    progress.value = Math.min(
      ceiling,
      progress.value + (ceiling - progress.value) * step
    )
  }

  function start(): void {
    stopTimer()

    isRunning.value = true
    progress.value = 0
    timer = setInterval(advance, tickMs)
  }

  function report(event: RequestProgress): void {
    if (!event.total) {
      return
    }

    // From the first measurable event on, the guess steps aside for good.
    stopTimer()

    const measured = Math.round((event.loaded / event.total) * 100)

    // Progress that goes backwards reads as a bug, whatever the wire says.
    progress.value = Math.min(100, Math.max(progress.value, measured))
  }

  function finish(): void {
    stopTimer()

    isRunning.value = false
    progress.value = 100
  }

  function reset(): void {
    stopTimer()

    isRunning.value = false
    progress.value = 0
  }

  // Usable outside a component too — a store, a guard, a plain module — where
  // there is no scope to hang the cleanup on.
  if (getCurrentScope()) {
    onScopeDispose(stopTimer)
  }

  return {
    progress,
    isRunning,
    start,
    report,
    finish,
    reset
  }
}

export {
  useLoadingProgress,
  type UseLoadingProgressOptions,
  type UseLoadingProgressReturn
}
