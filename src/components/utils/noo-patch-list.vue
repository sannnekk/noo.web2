<template>
  <div class="noo-patch-list">
    <div
      v-for="operation in patch"
      :key="operation.path"
      class="noo-patch-list__item"
    >
      <div class="noo-patch-list__item__title">
        <noo-text-block>
          {{ getOperationLabel(operation) }}
        </noo-text-block>
      </div>
      <div class="noo-patch-list__item__content">
        <div class="noo-patch-list__item__content__was">
          {{ getPrevValue(operation) }}
        </div>
        <div class="noo-patch-list__item__content__arrow">→</div>
        <div class="noo-patch-list__item__content__now">
          {{ readableValue(getNowValue(operation)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
// TODO: refactor
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { PossiblyUnsavedWorkTask } from '@/modules/works/types'
import type { PathLabelMap } from './noo-patch-list.types'

interface Props {
  patch: JsonPatchDocument<T>
  original: T
  pathLabels: PathLabelMap<T>
}

interface PathLabelRecord {
  label?: string
  [key: string]: PathLabelMap<unknown> | undefined
}

const props = defineProps<Props>()

const OPERATION_LABELS: Record<string, string> = {
  add: 'Добавлено',
  remove: 'Удалено',
  replace: 'Изменено',
  move: 'Перемещено',
  copy: 'Скопировано'
}

function getOperationLabel(operation: JsonPatchDocument<T>[number]): string {
  const operationLabel = OPERATION_LABELS[operation.op] ?? 'Изменение'
  const resolvedLabel = resolvePathLabel(operation.path, props.pathLabels)

  if (resolvedLabel) {
    return `${operationLabel}: ${resolvedLabel}`
  }

  return `${operationLabel} ${formatPointer(operation.path)}`
}

function getPrevValue(operation: JsonPatchDocument<T>[number]): unknown {
  if (operation.op === 'add') {
    return null
  }

  if (
    (operation.op === 'move' || operation.op === 'copy') &&
    'from' in operation
  ) {
    return normalizeValue(getValueByPointer(props.original, operation.from))
  }

  return normalizeValue(getValueByPointer(props.original, operation.path))
}

function getNowValue(operation: JsonPatchDocument<T>[number]): unknown {
  if ('value' in operation && operation.value !== undefined) {
    return normalizeValue(operation.value)
  }

  if (
    (operation.op === 'move' || operation.op === 'copy') &&
    'from' in operation
  ) {
    return normalizeValue(getValueByPointer(props.original, operation.from))
  }

  return null
}

function resolvePathLabel(
  path: string,
  map: PathLabelMap<T> | undefined
): string {
  if (!map) {
    return formatPointer(path)
  }

  const segments = decodePointer(path)

  if (!segments.length) {
    const rootLabel = getNodeLabel(map)

    if (rootLabel) {
      return rootLabel
    }

    return '/'
  }

  const labels: string[] = []
  let node: PathLabelMap<unknown> | undefined = map

  for (const segment of segments) {
    if (!node) {
      labels.push(formatSegment(segment))
      continue
    }

    if (typeof node === 'string') {
      labels.push(node)
      node = undefined
      continue
    }

    const recordNode = node as PathLabelRecord
    const nextNode = recordNode[segment] ?? recordNode['*']

    if (!nextNode) {
      labels.push(formatSegment(segment))
      node = undefined
      continue
    }

    const nextLabel = getNodeLabel(nextNode)

    labels.push(nextLabel ?? formatSegment(segment))
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

  const recordNode = node as PathLabelRecord

  return typeof recordNode.label === 'string' ? recordNode.label : undefined
}

function decodePointer(pointer: string): string[] {
  if (!pointer || pointer === '/') {
    return []
  }

  return pointer
    .split('/')
    .slice(1)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .filter((segment) => segment.length > 0)
}

function getValueByPointer(target: unknown, pointer: string): unknown {
  if (!pointer) {
    return target
  }

  const segments = decodePointer(pointer)

  return segments.reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined) {
      return undefined
    }

    if (Array.isArray(acc)) {
      const index = segment === '-' ? acc.length - 1 : Number(segment)

      if (Number.isNaN(index)) {
        return undefined
      }

      return acc[index]
    }

    if (typeof acc === 'object') {
      return (acc as Record<string, unknown>)[segment]
    }

    return undefined
  }, target)
}

function normalizeValue(value: unknown): unknown {
  if (value === undefined) {
    return null
  }

  return value
}

function formatPointer(path: string): string {
  const segments = decodePointer(path)

  if (!segments.length) {
    return '/'
  }

  return segments.join(' / ')
}

function formatSegment(segment: string): string {
  if (segment === '-') {
    return 'Новый элемент'
  }

  if (segment.startsWith('new-')) {
    return 'Новый элемент'
  }

  if (/^\d+$/.test(segment)) {
    const index = Number(segment)

    return Number.isNaN(index) ? segment : `Элемент ${index + 1}`
  }

  return segment
}

function readableValue(value: unknown): string {
  if (value === null) {
    return 'null'
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  // if its a task
  if (
    typeof value === 'object' &&
    '_entityName' in value &&
    value._entityName === 'WorkTask'
  ) {
    return `Задание номер ${(value as PossiblyUnsavedWorkTask).order}`
  }

  return String(value)
}
</script>

<style scoped lang="sass">
.noo-patch-list
  &__item
    display: flex
    flex-direction: row
    flex-wrap: wrap
    padding: 0.1em 1em
    border-radius: var(--border-radius)

    &:nth-child(even)
      background-color: var(--light-background-color)

    &__title
      margin-right: 0.5em

    &__content
      display: flex
      flex-direction: row
      align-items: center
      justify-content: flex-end
      flex: 1
      gap: 0.5em
      padding: 0 0.5em

      &__was,
      &__now
        background-color: var(--code-background)
        padding: 0.5em
        border-radius: var(--border-radius)
        white-space: pre-wrap
        word-break: break-word
        font-family: var(--font-monospace)

      &__arrow
        font-weight: bold
        font-size: 1.2em
        color: var(--text-secondary)
</style>
