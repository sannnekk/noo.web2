import jsonpatch from 'fast-json-patch'
import {
  normalizeJsonPatchTarget,
  type JsonPatchDocument
} from '@/core/utils/jsonpatch.utils'
import { getLabel, type LabelMap } from './noo-patch-list.types'

type PatchOperation<T extends object> = JsonPatchDocument<T>[number]

interface PatchListChange<T extends object> {
  key: string
  op: PatchOperation<T>['op']
  path: string
  pathKey: string
  label: string
  prevValue: unknown
  nowValue: unknown
  prevDisplayValue: string
  nowDisplayValue: string
}

function createPatchListChanges<T extends object>(
  patch: JsonPatchDocument<T>,
  original: T,
  pathLabels: LabelMap<T>
): PatchListChange<T>[] {
  const labelPaths = Object.keys(pathLabels)

  let currentState = normalizeJsonPatchTarget(original) as Record<
    string,
    unknown
  >

  return patch.map((operation, index) => {
    const previousState = currentState
    const prevValue = getValueByPointer(previousState, operation.path)
    const operationResult = jsonpatch.applyOperation(
      previousState,
      operation,
      false,
      false
    )

    currentState = operationResult.newDocument as Record<string, unknown>

    const nowValue = getValueByPointer(currentState, operation.path)
    const labelPath = resolveLabelPath(operation.path, labelPaths)
    const labelValuePath = toConcretePathFromLabel(operation.path, labelPath)
    const entityPath = getEntityPath(operation.path, labelPath)
    const prevLabelValue = getValueByPointer(previousState, labelValuePath)
    const nowLabelValue = getValueByPointer(currentState, labelValuePath)
    const prevEntity = getValueByPointer(previousState, entityPath)
    const nowEntity = getValueByPointer(currentState, entityPath)
    const valueForLabel =
      operation.op === 'remove'
        ? (prevLabelValue ?? nowLabelValue)
        : (nowLabelValue ?? prevLabelValue)
    const entityForLabel =
      operation.op === 'remove'
        ? (prevEntity ?? nowEntity ?? previousState)
        : (nowEntity ?? prevEntity ?? currentState)
    const rootForLabel = (
      operation.op === 'remove' ? previousState : currentState
    ) as T
    const label = getLabel(
      pathLabels,
      labelPath,
      valueForLabel,
      entityForLabel,
      rootForLabel,
      operation.path
    )
    const shouldUseLabelValue = labelPath !== operation.path
    const prevOutputValue = shouldUseLabelValue ? prevLabelValue : prevValue
    const nowOutputValue = shouldUseLabelValue ? nowLabelValue : nowValue

    return {
      key: `${index}-${operation.op}-${operation.path}`,
      op: operation.op,
      path: operation.path,
      pathKey: toSlotPathKey(labelPath),
      label,
      prevValue: prevOutputValue,
      nowValue: nowOutputValue,
      prevDisplayValue: formatPatchValue(prevOutputValue),
      nowDisplayValue: formatPatchValue(nowOutputValue)
    }
  })
}

function resolveLabelPath(path: string, labelPaths: string[]): string {
  const directMatch = findBestPathMatch(path, labelPaths)

  if (directMatch) {
    return directMatch
  }

  const pathSegments = splitPointer(path)

  for (let index = pathSegments.length - 1; index > 0; index -= 1) {
    const parentPath = `/${pathSegments.slice(0, index).join('/')}`
    const parentMatch = findBestPathMatch(parentPath, labelPaths)

    if (parentMatch) {
      return parentMatch
    }
  }

  return path
}

function findBestPathMatch(path: string, labelPaths: string[]): string | null {
  const matches = labelPaths.filter((labelPath) => isPathMatch(path, labelPath))

  if (matches.length === 0) {
    return null
  }

  return (
    matches.sort(
      (leftPath, rightPath) =>
        countWildcardSegments(leftPath) - countWildcardSegments(rightPath)
    )[0] ?? null
  )
}

function isPathMatch(path: string, labelPath: string): boolean {
  const pathSegments = splitPointer(path)
  const labelSegments = splitPointer(labelPath)

  if (pathSegments.length !== labelSegments.length) {
    return false
  }

  return labelSegments.every(
    (labelSegment, index) =>
      labelSegment === '*' || labelSegment === pathSegments[index]
  )
}

function countWildcardSegments(path: string): number {
  return splitPointer(path).filter((segment) => segment === '*').length
}

function splitPointer(path: string): string[] {
  if (!path || path === '/') {
    return []
  }

  return path.split('/').slice(1)
}

function toConcretePathFromLabel(path: string, labelPath: string): string {
  const pathSegments = splitPointer(path)
  const labelSegments = splitPointer(labelPath)

  if (labelSegments.length === 0) {
    return ''
  }

  const concreteSegments = mapLabelSegmentsToPathSegments(
    labelSegments,
    pathSegments
  )

  return `/${concreteSegments.join('/')}`
}

function getEntityPath(path: string, labelPath: string): string {
  const pathSegments = splitPointer(path)
  const labelSegments = splitPointer(labelPath)
  const wildcardIndex = labelSegments.indexOf('*')

  if (wildcardIndex === -1) {
    return ''
  }

  const entitySegments = mapLabelSegmentsToPathSegments(
    labelSegments.slice(0, wildcardIndex + 1),
    pathSegments
  )

  return `/${entitySegments.join('/')}`
}

function mapLabelSegmentsToPathSegments(
  labelSegments: string[],
  pathSegments: string[]
): string[] {
  return labelSegments.map((labelSegment, index) =>
    labelSegment === '*' ? (pathSegments[index] ?? labelSegment) : labelSegment
  )
}

function decodePointerSegment(segment: string): string {
  return segment.replaceAll('~1', '/').replaceAll('~0', '~')
}

function getValueByPointer(target: unknown, path: string): unknown {
  if (!path) {
    return target
  }

  const segments = splitPointer(path).map(decodePointerSegment)
  let current: unknown = target

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined
    }

    if (Array.isArray(current)) {
      const index = Number(segment)

      if (!Number.isInteger(index)) {
        return undefined
      }

      current = current[index]

      continue
    }

    if (typeof current !== 'object') {
      return undefined
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

function toSlotPathKey(path: string): string {
  return path.replaceAll('/', '-').replaceAll('*', 'any')
}

function formatPatchValue(value: unknown): string {
  if (value === undefined) {
    return '—'
  }

  if (value === null) {
    return 'null'
  }

  if (typeof value === 'string') {
    return value.length > 0 ? value : '""'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

export type { PatchListChange }
export { createPatchListChanges }
