import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { deepCopy } from '@/core/utils/object.utils'
import { isRichtext } from '@/core/utils/richtext.utils'
import { applyPatch } from 'fast-json-patch'
import type { Change, PathLabelMap } from './noo-patch-list.types'

function decodeJsonPointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function isArrayIndex(segment: string): boolean {
  return segment === '-' || /^\d+$/.test(segment)
}

function getPathLabel<T extends object>(
  path: string,
  map: PathLabelMap<T>
): string | undefined {
  const segments = decodeJsonPointerSegment(path)

  if (!segments.length) {
    const rootLabel = getNodeLabel(map)

    if (rootLabel) {
      return rootLabel
    }

    return '/'
  }

  const labels: string[] = []
  let node: PathLabelMap<unknown> | undefined = map

  for (const segment of segments.split('/').slice(1)) {
    if (!node) {
      continue
    }

    if (typeof node === 'string') {
      labels.push(node)
      node = undefined
      continue
    }

    const recordNode = node as {
      label?: string
      [key: string]: PathLabelMap<unknown> | undefined
    }
    const nextNode = recordNode[segment] ?? recordNode['*']

    if (!nextNode) {
      node = undefined
      continue
    }

    const nextLabel = getNodeLabel(nextNode)

    if (nextLabel) {
      labels.push(nextLabel)
    }
    node = nextNode
  }

  return labels.join(' → ')
}

function getNodeLabel(
  node: PathLabelMap<unknown> | undefined
): string | undefined {
  if (!node) {
    return undefined
  }

  if (typeof node === 'string') {
    return node
  }

  const recordNode = node

  return typeof recordNode.label === 'string' ? recordNode.label : undefined
}

function getChanges<T extends object>(
  original: T,
  patch: JsonPatchDocument<T>,
  pathLabels: PathLabelMap<T>
): Change<T>[] {
  const changes: Record<string, Change<T>> = {}

  for (const operation of patch) {
    if (!operation?.path || !operation.op) {
      continue
    }

    const [keyPath, richtextPath] = splitRichtextPathSegment(operation.path)
    const label = getPathLabel(keyPath, pathLabels)

    if (!label) {
      continue
    }

    const { value, type } = getValue<T>(original, operation.path)

    const newOperation = {
      op: operation.op,
      path: richtextPath ? richtextPath : operation.path,
      // @ts-expect-error value can be missing for remove operations
      value: operation.value
    } as JsonPatchDocument<T>[number]

    const change: Change<T> = {
      label,
      operations: [newOperation],
      pathKey: decodeJsonPointerSegment(keyPath).replaceAll('/', '-'),
      type,
      prevValue: value,
      nowValue: undefined
    }

    if (changes[keyPath]) {
      changes[keyPath].operations.push(newOperation)
    } else {
      changes[keyPath] = change
    }
  }

  const updatedObj = applyPatch(
    deepCopy(original),
    patch,
    /* validateOperation */ false,
    /* mutateDocument */ false
  ).newDocument

  // use operations to set nowValue
  return Object.values(changes)
    .filter((change): change is Change<T> => Boolean(change))
    .map((change) => {
      if (change.operations.length === 0) {
        return change
      }

      if (change.type === 'richtext') {
        change.nowValue = applyPatch(
          deepCopy(change.prevValue as T),
          change.operations,
          /* validateOperation */ false,
          /* mutateDocument */ false
        ).newDocument

        return change
      }

      change.nowValue = getValue<T>(updatedObj, change.operations[0].path).value

      return change
    })
}

function getValue<T extends object>(
  original: T,
  path: string
): { value: unknown; type: Change<T>['type'] } {
  if (!path || path === '/') {
    return {
      value: original,
      type: original instanceof Date ? 'date' : 'regular'
    }
  }

  const segments = path
    .split('/')
    .slice(path.startsWith('/') ? 1 : 0)
    .map(decodeJsonPointerSegment)

  let current: unknown = original

  for (const segment of segments) {
    if (current === undefined || current === null) {
      return { value: undefined, type: 'regular' }
    }

    // if we find richtext, we do not go deeper
    if (isRichtext(current)) {
      return { value: current, type: 'richtext' }
    }

    if (Array.isArray(current)) {
      if (segment === '-') {
        return { value: undefined, type: 'regular' }
      }

      if (isArrayIndex(segment)) {
        current = current[Number(segment)]
        continue
      }

      const match = current.find((item) => {
        if (!item || typeof item !== 'object') {
          return false
        }

        const entity = item as { id?: string | number; _key?: string | number }

        return String(entity.id ?? entity._key ?? '') === segment
      })

      current = match
      continue
    }

    if (typeof current === 'object') {
      try {
        current = (current as Record<string, unknown>)[segment]
      } catch {
        return { value: undefined, type: 'regular' }
      }

      continue
    }

    return { value: undefined, type: 'regular' }
  }

  return { value: current, type: current instanceof Date ? 'date' : 'regular' }
}

/**
 * Return the path split into richtext path segment and the rest
 *
 * @important strongly dependend on Richtext implementation details
 */
function splitRichtextPathSegment(path: string): [string, string] {
  const segments = path.split('/')
  const index = segments.indexOf('ops')

  if (index === -1) {
    return [path, '']
  }

  const before = segments.slice(0, index + 1).join('/')
  const after = '/' + segments.slice(index).join('/')

  return [before, after]
}

export { getChanges }
