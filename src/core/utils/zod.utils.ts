import { ZodType } from 'zod'

/**
 * Enforce that the type parameter T is exactly
 * what the Zod schema actually parses to.
 */
function assertSchema<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends ZodType<T, any, any>
>(s: S): S {
  return s
}

export function getValidationErrors<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<T, any, any>,
  value: unknown
): string[] {
  const result = schema.safeParse(value)

  if (result.success) {
    return []
  }

  return result.error.errors.map((e) => e.message)
}

export { assertSchema }
