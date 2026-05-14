import type { ValidationError } from './validation-helpers.utils'
import {
  ROOT_ERROR_KEY,
  type FieldErrors,
  type ZodValidationResult
} from './zod-validation.utils'

interface ValidationState {
  isValid: boolean
  /**
   * Flat list of all error messages with field paths included.
   * Useful for summary blocks (e.g. a save-confirm modal listing every issue).
   */
  errors: string[]
  /**
   * Errors grouped by field path. Bind to per-input `:errors` props as
   * `:errors="state.fieldErrors.someField"`.
   */
  fieldErrors: FieldErrors
  /**
   * Errors NOT tied to a single field (cross-field rules from `.refine` /
   * `.superRefine` that resolve to the root path). Render these via
   * `<noo-form-errors :errors="state.rootErrors" />` near the submit button.
   */
  rootErrors: ValidationError[]
}

interface ValidationStateOptions {
  includeFieldPath?: boolean
}

function createValidationState(): ValidationState {
  return {
    isValid: true,
    errors: [],
    fieldErrors: {},
    rootErrors: []
  }
}

function buildValidationStateFromZodResult(
  result: Pick<ZodValidationResult, 'isValid' | 'fieldErrors'>,
  options: ValidationStateOptions = {}
): ValidationState {
  const errors = buildValidationErrors(result.fieldErrors, options)
  const rootErrors = result.fieldErrors[ROOT_ERROR_KEY] ?? []

  return {
    isValid: result.isValid,
    errors,
    fieldErrors: result.fieldErrors,
    rootErrors
  }
}

function buildValidationErrors(
  fieldErrors: FieldErrors,
  options: ValidationStateOptions = {}
): string[] {
  const includeFieldPath = options.includeFieldPath ?? true

  return Object.entries(fieldErrors).flatMap(([path, errors]) =>
    errors.map((error) =>
      formatValidationErrorMessage(error, path, includeFieldPath)
    )
  )
}

function formatValidationErrorMessage(
  error: ValidationError,
  path: string,
  includeFieldPath: boolean
): string {
  const normalizedPath = path === ROOT_ERROR_KEY ? '' : path

  if (!includeFieldPath || !normalizedPath) {
    return error.message
  }

  return `${normalizedPath}: ${error.message}`
}

export {
  buildValidationErrors,
  buildValidationStateFromZodResult,
  createValidationState,
  type ValidationState
}
