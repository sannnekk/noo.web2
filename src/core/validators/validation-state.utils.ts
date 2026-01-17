import type { ValidationError } from './validation-helpers.utils'
import {
  ROOT_ERROR_KEY,
  type FieldErrors,
  type ZodValidationResult
} from './zod-validation.utils'

interface ValidationState {
  isValid: boolean
  errors: string[]
  fieldErrors: FieldErrors
}

interface ValidationStateOptions {
  includeFieldPath?: boolean
}

function createValidationState(): ValidationState {
  return {
    isValid: true,
    errors: [],
    fieldErrors: {}
  }
}

function buildValidationStateFromZodResult(
  result: Pick<ZodValidationResult, 'isValid' | 'fieldErrors'>,
  options: ValidationStateOptions = {}
): ValidationState {
  const errors = buildValidationErrors(result.fieldErrors, options)

  return {
    isValid: result.isValid,
    errors,
    fieldErrors: result.fieldErrors
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
