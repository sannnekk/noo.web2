import _ from 'lodash'
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
 * Converts an API entity to a PossiblyUnsavedEntity:
 * - adds _key property to the entity and the nested entities
 * - casts type so that id, createdAt, updatedAt are optional
 *
 * @param obj Entity received from the server
 * @returns PossiblyUnsavedEntity instance
 */
function convertToLocal<T extends ApiEntity, U = PossiblyUnsavedEntity<T>>(
  obj: T
): U {
  const localObj: PossiblyUnsavedEntity<T> = { ...obj, _key: uid() }

  for (const [key, value] of Object.entries(localObj)) {
    if (Array.isArray(value)) {
      // @ts-expect-error - we know that we can index into localObj with key
      localObj[key] = convertArrayItems(value) as unknown
      continue
    }

    if (typeof value === 'object' && value !== null) {
      // @ts-expect-error - we know that we can index into localObj with key
      localObj[key] = convertToLocal(value as ApiEntity) as unknown
    }
  }

  return localObj as U
}

function convertArrayItems(items: unknown[]): unknown[] {
  return items.map((item) => {
    if (Array.isArray(item)) {
      return convertArrayItems(item)
    }

    if (typeof item === 'object' && item !== null) {
      return convertToLocal(item as ApiEntity)
    }

    return item
  })
}

export { convertToLocal, uid }
