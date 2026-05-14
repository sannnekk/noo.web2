import {
  buildValidationStateFromZodResult,
  createValidationState,
  type ValidationState
} from '@/core/validators/validation-state.utils'
import type { ZodValidationResult } from '@/core/validators/zod-validation.utils'
import { ref, watch, type Ref } from 'vue'

type ValidationFn<T> = (
  value: T
) => ZodValidationResult | Promise<ZodValidationResult>

interface ValidationWatchOptions {
  /**
   * Whether to watch the target for changes and re-validate automatically.
   *
   * @default true
   */
  watch?: boolean
  /**
   * Whether to perform a deep watch on the target.
   *
   * @default true
   */
  deep?: boolean
}

/**
 * Reactive entity validation against a Zod-based validator. Watches the target
 * by default and exposes a `ValidationState` (`isValid`, `errors`, `fieldErrors`,
 * `rootErrors`) ready to bind to inputs and form-level error blocks.
 *
 * The validator may be sync or async. Concurrent runs are guarded so a slower
 * earlier validation cannot overwrite a newer result — only the latest result
 * is applied.
 *
 * ## Where to use this
 *
 * - **In a view** for form state that lives and dies with the view (e.g. a
 *   settings page, a single-screen create flow). This is the default — keeps
 *   stores thin.
 * - **In a Pinia store** only when the validation state must be shared across
 *   views or sibling components (e.g. a work editor whose sidebar, task grid,
 *   and save-modal all read the same validation state).
 */
function useEntityValidation<T>(
  target: Ref<T | null>,
  validateFn: ValidationFn<T>,
  options: ValidationWatchOptions = {}
) {
  const validationState = ref<ValidationState>(createValidationState())
  let latestRunId = 0

  function reset(): void {
    latestRunId++
    validationState.value = createValidationState()
  }

  async function validate(): Promise<void> {
    if (!target.value) {
      reset()

      return
    }

    const runId = ++latestRunId
    const result = await validateFn(target.value)

    if (runId !== latestRunId) {
      return
    }

    validationState.value = buildValidationStateFromZodResult(result)
  }

  const shouldWatch = options.watch ?? true
  const isDeep = options.deep ?? true

  const stop = shouldWatch
    ? watch(target, () => void validate(), { deep: isDeep })
    : null

  return {
    validationState,
    validate,
    reset,
    stop
  }
}

export { useEntityValidation, type ValidationFn, type ValidationWatchOptions }
