import jsonpatch, {
  type AddOperation,
  type CopyOperation,
  type GetOperation,
  type MoveOperation,
  type RemoveOperation,
  type ReplaceOperation,
  type TestOperation
} from 'fast-json-patch'
import _ from 'lodash'
import type { ApiEntity } from '../api/api.types'

type JsonPatchOperation<TValue extends object> =
  | AddOperation<JsonPatchValue<TValue>>
  | ReplaceOperation<JsonPatchValue<TValue>>
  | TestOperation<JsonPatchValue<TValue>>
  | GetOperation<JsonPatchValue<TValue>>
  | RemoveOperation
  | MoveOperation
  | CopyOperation

type JsonPatchValue<T> = T extends readonly (infer U)[]
  ? JsonPatchValue<U> | T
  : T extends object
    ? T | { [K in keyof T]-?: JsonPatchValue<T[K]> }[keyof T]
    : T

type JsonPatchDocument<TValue extends object> = JsonPatchOperation<TValue>[]

interface PatchGenerator<T extends object> {
  generate: () => JsonPatchDocument<T>
  getOriginal: () => T
  countChanges: () => number
}

/**
 * Observes an object and returns a function that generates a JSON Patch document
 *
 */
function observe<T extends object>(obj: T): PatchGenerator<T> {
  const original = normalizeJsonPatchTarget(_.cloneDeep(obj)) as T

  // Filter out the following keys from the JSON Patch document:
  // - _key (local only property)
  // - _entityName (static property)
  // - id, createdAt, updatedAt (managed by the backend)
  const excludedPaths = ['_key', '_entityName', 'id', 'createdAt', 'updatedAt']

  function generate(): JsonPatchDocument<T> {
    return jsonpatch
      .compare(original, normalizeJsonPatchTarget(obj) as T)
      .filter(
        (operation) =>
          !excludedPaths.some((path) => operation.path.endsWith(path))
      )
  }

  return {
    generate,
    getOriginal: () => original,
    countChanges: () => generate().length
  }
}

/**
 * This is needed to properly handle arrays of entities when generating
 * JSON Patch documents, because otherwise the patch operations would use
 * array indices which can lead to issues when the array is modified.
 */
function normalizeJsonPatchTarget(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (value.length > 0 && isEntityArray(value)) {
      return value.reduce<Record<string, unknown>>((acc, item) => {
        const entity = item as unknown as Record<string, unknown>
        const entityId = entity.id as string | number

        const newIdentifier = _.uniqueId('new-')

        acc[String(entityId ?? newIdentifier)] =
          normalizeJsonPatchTarget(entity)

        return acc
      }, {})
    }

    return value.map((item) => normalizeJsonPatchTarget(item))
  }

  if (_.isPlainObject(value)) {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, item]) => {
        acc[key] = normalizeJsonPatchTarget(item)

        return acc
      },
      {} as Record<string, unknown>
    )
  }

  return value
}

/**
 * Type guard to check if an array contains ApiEntity objects
 */
function isEntityArray(value: unknown[]): value is ApiEntity[] {
  return value.some(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      '_entityName' in (item as ApiEntity)
  )
}

export const JsonPatchUtils = { observe }

export type { JsonPatchDocument, PatchGenerator }
