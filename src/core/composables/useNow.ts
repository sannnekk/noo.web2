import { onScopeDispose, readonly, ref, type Ref } from 'vue'

/**
 * Shared, app-wide "current time" clock.
 *
 * A single interval ticks for the whole application regardless of how many
 * components observe it, so relative-time displays (e.g. "23 минуты назад")
 * stay up to date without each component spinning up its own timer.
 */
const TICK_INTERVAL_MS = 15_000

const now = ref<Date>(new Date())

let timer: ReturnType<typeof setInterval> | null = null
let subscribers = 0

function start(): void {
  if (timer !== null) {
    return
  }

  timer = setInterval(() => {
    now.value = new Date()
  }, TICK_INTERVAL_MS)
}

function stop(): void {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

/**
 * Returns a reactive, read-only `Date` that updates every {@link TICK_INTERVAL_MS}.
 * The underlying timer is automatically released when the last consumer's
 * effect scope is disposed.
 */
export function useNow(): Readonly<Ref<Date>> {
  subscribers += 1
  // Refresh immediately so a freshly mounted consumer never shows a stale tick.
  now.value = new Date()
  start()

  onScopeDispose(() => {
    subscribers -= 1

    if (subscribers <= 0) {
      stop()
    }
  })

  return readonly(now)
}
