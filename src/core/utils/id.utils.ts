import _ from 'lodash'
import { ulid } from 'ulid'
import type { ApiEntity } from '../api/api.types'
import type { PossiblyUnsavedEntity } from './types.utils'

/**
 * Generates a unique identifier string.
 *
 * @return A unique identifier.
 */
function uid(): string {
  return _.uniqueId()
}

/**
 * Generates a canonical ULID, compatible with the backend `System.Ulid` columns.
 *
 * Used when the client must mint a stable id before saving — e.g. a new course
 * chapter, whose id is referenced by its children through `parentChapterId` in the
 * flattened update patch (see normalizeCoursePatch).
 *
 * @return A canonical 26-character ULID string.
 */
function newUlid(): string {
  return ulid()
}

/**
 * Converts an API entity to a PossiblyUnsavedEntity:
 * - adds _key property to the entity and the nested entities
 * - casts type so that id, createdAt, updatedAt are optional
 *
 * @param obj Entity received from the server
 * @returns PossiblyUnsavedEntity instance
 */
function convertToLocal<
  T extends ApiEntity<TName>,
  TName extends string = T['_entityName'],
  U = PossiblyUnsavedEntity<T, TName>
>(obj: T): U {
  const hasEntityName =
    typeof (obj as Record<string, unknown>)._entityName === 'string'
  const localObj = (hasEntityName
    ? { ...obj, _key: uid() }
    : { ...obj }) as unknown as PossiblyUnsavedEntity<T, TName>

  for (const [key, value] of Object.entries(localObj)) {
    if (Array.isArray(value)) {
      // @ts-expect-error - we know that we can index into localObj with key
      localObj[key] = convertArrayItems(value) as unknown
      continue
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      Object.prototype.isPrototypeOf.call(Date.prototype, value) === false
    ) {
      // @ts-expect-error - we know that we can index into localObj with key
      localObj[key] = convertToLocal(value as ApiEntity) as unknown
    }
  }

  return localObj as U
}

function convertArrayItems<TName extends string>(items: unknown[]): unknown[] {
  return items.map((item) => {
    if (Array.isArray(item)) {
      return convertArrayItems(item)
    }

    if (typeof item === 'object' && item !== null) {
      return convertToLocal(item as ApiEntity<TName>)
    }

    return item
  })
}

export { convertToLocal, newUlid, uid }
