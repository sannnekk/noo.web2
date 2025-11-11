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

function getValidationErrors<T>(schema: ZodType<T>, data: unknown): string[] {
  const result = schema.safeParse(data)

  if (result.success) {
    return []
  }

  return result.error.errors.map((err) => {
    const path = err.path.length > 0 ? `Path "${err.path.join('.')}"` : 'Root'

    return `${path}: ${err.message}`
  })
}

export { assertSchema, getValidationErrors }
