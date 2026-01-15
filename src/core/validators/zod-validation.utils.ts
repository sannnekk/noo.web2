import type { ZodIssue, ZodTypeAny } from 'zod'
import type { ValidationError } from './validation-helpers.utils'

const ROOT_ERROR_KEY = '__root'
const FALLBACK_MESSAGE = 'Некорректное значение'

type ZodFieldErrors = Record<string, ValidationError[]>

interface ZodValidationResult {
  isValid: boolean
  fieldErrors: ZodFieldErrors
  messages: string[]
}

function normalizeMessage(message: string): string {
  const normalized = message?.trim()

  if (!normalized) {
    return FALLBACK_MESSAGE
  }

  const hasLatin = /[A-Za-z]/.test(normalized)

  if (hasLatin) {
    return FALLBACK_MESSAGE
  }

  return normalized
}

function toPathString(path: ZodIssue['path']): string {
  if (!path.length) {
    return ROOT_ERROR_KEY
  }

  return path.map((segment) => String(segment)).join('.')
}

function mergeFieldError(
  fieldErrors: ZodFieldErrors,
  path: string,
  message: string
): void {
  if (!fieldErrors[path]) {
    fieldErrors[path] = []
  }
  const existing = fieldErrors[path].some((error) => error.message === message)

  if (!existing) {
    fieldErrors[path].push({ kind: 'error', message })
  }
}

function getZodFieldErrors(schema: ZodTypeAny, data: unknown): ZodFieldErrors {
  const result = schema.safeParse(data)

  if (result.success) {
    return {}
  }

  const fieldErrors: ZodFieldErrors = {}

  for (const issue of result.error.issues) {
    const path = toPathString(issue.path)
    const message = normalizeMessage(issue.message)

    mergeFieldError(fieldErrors, path, message)
  }

  return fieldErrors
}

function flattenZodFieldErrors(fieldErrors: ZodFieldErrors): string[] {
  return Object.values(fieldErrors)
    .flat()
    .map((error) => error.message)
}

function validateWithZod(
  schema: ZodTypeAny,
  data: unknown
): ZodValidationResult {
  const fieldErrors = getZodFieldErrors(schema, data)
  const messages = flattenZodFieldErrors(fieldErrors)

  return {
    isValid: messages.length === 0,
    fieldErrors,
    messages
  }
}

function getFieldErrors(
  fieldErrors: ZodFieldErrors,
  path: string
): ValidationError[] {
  return fieldErrors[path] ?? []
}

export {
  FALLBACK_MESSAGE,
  flattenZodFieldErrors,
  getFieldErrors,
  getZodFieldErrors,
  ROOT_ERROR_KEY,
  validateWithZod,
  type ZodFieldErrors,
  type ZodValidationResult
}
