type Primitive = string | number | boolean | bigint | symbol

type Nil = null | undefined

type AnyFunction = (...args: never[]) => unknown

type IsPlainObject<T> = T extends Primitive | Nil | Date | AnyFunction
  ? false
  : T extends readonly unknown[]
    ? false
    : T extends object
      ? true
      : false

/**
 * Extracts the array element type, handling optional arrays.
 * `T[] | undefined` → `T`, `readonly T[]` → `T`
 */
type ArrayElement<T> = NonNullable<T> extends readonly (infer U)[] ? U : never

/**
 * Checks if a type is an array (including optional arrays).
 */
type IsArray<T> = NonNullable<T> extends readonly unknown[] ? true : false

/**
 * Generates all valid JSON Patch paths for a given type.
 * Handles nested objects, arrays (with `*` wildcard), and primitives.
 */
type JsonPatchPath<T> = T extends Primitive | Nil
  ? never
  : {
      [K in keyof T & string]: NonNullable<T[K]> extends Primitive | Date
        ? `/${K}`
        : IsArray<T[K]> extends true
          ?
              | `/${K}`
              | `/${K}/*`
              | (IsPlainObject<ArrayElement<T[K]>> extends true
                  ? `/${K}/*${JsonPatchPath<ArrayElement<T[K]>>}`
                  : `/${K}/*`)
          : IsPlainObject<NonNullable<T[K]>> extends true
            ? `/${K}` | `/${K}${JsonPatchPath<NonNullable<T[K]>>}`
            : `/${K}`
    }[keyof T & string]

/**
 * Resolves the value type at a given JSON Patch path.
 * Handles nested paths like `/tasks/*\/order` and returns the appropriate type.
 */
type ResolvePathType<
  T,
  P extends string
> = P extends `/${infer Key}/${infer Rest}`
  ? Key extends keyof T
    ? IsArray<T[Key]> extends true
      ? Rest extends `*`
        ? ArrayElement<T[Key]>
        : Rest extends `*/${infer SubPath}`
          ? ResolvePathType<ArrayElement<T[Key]>, `/${SubPath}`>
          : never
      : ResolvePathType<NonNullable<T[Key]>, `/${Rest}`>
    : never
  : P extends `/${infer Key}`
    ? Key extends '*'
      ? T
      : Key extends keyof T
        ? T[Key]
        : never
    : never

/**
 * Resolves the parent entity type for array item paths.
 * For `/tasks/*` or `/tasks/*\/field`, returns the array element type (e.g., WorkTaskEntity).
 * For non-array paths, returns the root entity type.
 */
type ResolveEntityType<
  T,
  P extends string
> = P extends `/${infer Key}/${infer Rest}`
  ? Key extends keyof T
    ? IsArray<T[Key]> extends true
      ? Rest extends `*${string}`
        ? ArrayElement<T[Key]>
        : T
      : ResolveEntityType<NonNullable<T[Key]>, `/${Rest}`>
    : T
  : T

/**
 * Context provided to label callback functions.
 * @template TRoot - The root entity type (e.g., WorkEntity)
 * @template TValue - The value type at the path
 * @template TEntity - The immediate parent entity type for array items
 */
export interface LabelContext<TRoot, TValue, TEntity> {
  /** The value at the current path */
  value: TValue
  /** The JSON Patch path string (with actual indices, not wildcards) */
  path: string
  /** The immediate parent entity (for array items, this is the array element) */
  entity: TEntity
  /** The root entity being patched */
  root: TRoot
}

/**
 * A label can be either a static string or a function that receives typed context.
 */
export type Label<TRoot, TValue, TEntity> =
  | string
  | ((ctx: LabelContext<TRoot, TValue, TEntity>) => string)

/**
 * A strongly-typed map of JSON Patch paths to their labels.
 * Supports both static string labels and callback functions with typed context.
 *
 * @example
 * ```ts
 * const labels: LabelMap<WorkEntity> = {
 *   '/title': 'Title',
 *   '/tasks': (ctx) => `Task #${ctx.value.order}`, // ctx.value is WorkTaskEntity[]
 *   '/tasks/*': (ctx) => `Task #${ctx.value.order}`, // ctx.value is WorkTaskEntity
 *   '/tasks/*\/order': (ctx) => `Order of task #${ctx.entity.order}` // ctx.entity is WorkTaskEntity
 * }
 * ```
 */
export type LabelMap<T> = {
  [P in JsonPatchPath<T>]?: Label<
    T,
    ResolvePathType<T, P>,
    ResolveEntityType<T, P>
  >
}

type RuntimeLabelCallback<TRoot> = (
  ctx: LabelContext<TRoot, unknown, unknown>
) => string

function getLabel<T>(
  labelMap: LabelMap<T>,
  path: string,
  value: unknown,
  entity: unknown,
  root: T,
  contextPath = path
): string {
  const labelOrFn = labelMap[path as JsonPatchPath<T>]

  if (typeof labelOrFn === 'string') {
    return labelOrFn
  }

  if (typeof labelOrFn === 'function') {
    const getDynamicLabel = labelOrFn as RuntimeLabelCallback<T>

    return getDynamicLabel({
      value,
      path: contextPath,
      entity,
      root
    })
  }

  // Fallback to the path itself if no label is defined
  return path
}

export { getLabel }
