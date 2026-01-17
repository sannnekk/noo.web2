import {
  buildValidationStateFromZodResult,
  createValidationState,
  type ValidationState
} from '@/core/validators/validation-state.utils'
import type { ZodValidationResult } from '@/core/validators/zod-validation.utils'
import { ref, watch, type Ref } from 'vue'

type ValidationFn<T> = (value: T) => ZodValidationResult

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

function useEntityValidation<T>(
  target: Ref<T | null>,
  validateFn: ValidationFn<T>,
  options: ValidationWatchOptions = {}
) {
  const validationState = ref<ValidationState>(createValidationState())

  function reset(): void {
    validationState.value = createValidationState()
  }

  function validate(): void {
    if (!target.value) {
      reset()

      return
    }

    const result = validateFn(target.value)

    validationState.value = buildValidationStateFromZodResult(result)
  }

  const shouldWatch = options.watch ?? true
  const isDeep = options.deep ?? true

  const stop = shouldWatch ? watch(target, validate, { deep: isDeep }) : null

  return {
    validationState,
    validate,
    reset,
    stop
  }
}

export { useEntityValidation, type ValidationFn, type ValidationWatchOptions }
