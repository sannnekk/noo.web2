<template>
  <div class="noo-entity-select noo-input">
    <div class="noo-input__head">
      <label class="noo-input__label">
        {{ label }}
      </label>
      <span
        v-if="$slots.tooltip"
        class="noo-input__explanation-tooltip"
      >
        <noo-tooltip>
          <slot name="tooltip" />
        </noo-tooltip>
      </span>
    </div>
    <div
      ref="rootRef"
      class="noo-entity-select__container"
    >
      <div
        class="noo-entity-select__control"
        :class="{
          'noo-entity-select__control--focused': isFlyoutOpen,
          'noo-entity-select__control--error': errors?.length,
          'noo-entity-select__control--readonly': readonly
        }"
        @click="focusInput"
      >
        <div
          v-if="selectedEntities.length"
          class="noo-entity-select__chips"
        >
          <button
            v-for="entity in selectedEntities"
            :key="getEntityId(entity)"
            type="button"
            class="noo-entity-select__chip"
            :disabled="readonly"
            @click.stop="removeEntity(getEntityId(entity))"
          >
            <slot
              name="chip"
              :entity="entity"
            >
              <span>{{ getEntityLabel(entity) }}</span>
            </slot>
            <noo-icon
              v-if="!readonly"
              name="close"
              class="noo-entity-select__chip__remove"
            />
          </button>
        </div>
        <input
          v-if="multiple || !selectedEntities.length"
          ref="inputRef"
          v-model="inputValue"
          class="noo-entity-select__input"
          :placeholder="placeholder"
          :disabled="readonly"
          :readonly="readonly"
          autocomplete="off"
          @focus="openFlyout"
          @keydown="onInputKeydown"
        />
        <div class="noo-entity-select__actions">
          <noo-loader-icon
            v-if="isBusy"
            class="noo-entity-select__icon"
            contrast
          />
          <noo-icon
            v-else-if="canClear"
            name="close"
            class="noo-entity-select__icon noo-entity-select__icon--clickable"
            @click.stop="clearControl"
          />
        </div>
      </div>

      <div
        v-if="isFlyoutOpen"
        class="noo-entity-select__flyout"
      >
        <div
          v-if="suggestionState === 'loading'"
          class="noo-entity-select__state"
        >
          <noo-loader-icon contrast />
          <span>Загрузка...</span>
        </div>
        <div
          v-else-if="suggestionState === 'error'"
          class="noo-entity-select__state noo-entity-select__state--error"
        >
          Не удалось загрузить список.
          <span
            class="noo-entity-select__retry"
            @click="retrySuggestionsLoad"
          >
            Повторить
          </span>
        </div>
        <div
          v-else-if="!visibleSuggestions.length"
          class="noo-entity-select__state"
        >
          Ничего не найдено.
        </div>
        <ul
          v-else
          class="noo-entity-select__suggestions"
          role="listbox"
        >
          <li
            v-for="(entity, index) in visibleSuggestions"
            :key="getEntityId(entity)"
            class="noo-entity-select__suggestion"
            :class="{
              'noo-entity-select__suggestion--highlighted':
                highlightedSuggestionIndex === index,
              'noo-entity-select__suggestion--selected': isEntitySelected(
                getEntityId(entity)
              )
            }"
            role="option"
            :aria-selected="isEntitySelected(getEntityId(entity))"
            @mouseenter="highlightedSuggestionIndex = index"
            @mousedown.prevent="selectEntity(entity)"
          >
            <slot
              name="option"
              :entity="entity"
            >
              <span class="noo-entity-select__suggestion__title">
                {{ getEntityLabel(entity) }}
              </span>
            </slot>
          </li>
        </ul>
      </div>
    </div>
    <div
      v-if="selectionState === 'error'"
      class="noo-entity-select__selection-error"
    >
      Не удалось загрузить выбранные элементы.
      <span
        class="noo-entity-select__retry"
        @click="retrySelectionLoad"
      >
        Повторить
      </span>
    </div>
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string }">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { onClickOutside } from '@vueuse/core'
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  errors?: ValidationError[]
  multiple?: boolean
  fetch: (query: string) => Promise<T[]>
  resolve?: (ids: string[]) => Promise<T[]>
  toKey?: (entity: T) => string
  toLabel: (entity: T) => string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  readonly: false,
  multiple: false
})

const model = defineModel<T | T[] | null>({
  default: null
})

const idsModel = defineModel<string | string[] | null>('ids', {
  default: null
})

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const selectedEntities = shallowRef<T[]>([])
const suggestions = shallowRef<T[]>([])
const suggestionState = shallowRef<'idle' | 'loading' | 'loaded' | 'error'>(
  'idle'
)
const selectionState = shallowRef<'idle' | 'loading' | 'error'>('idle')
const highlightedSuggestionIndex = ref(-1)
const isFlyoutOpen = ref(false)
const isApplyingInternalSync = ref(false)
const cachedEntities = shallowRef<Record<string, T>>({})

let externalSyncToken = 0
let suggestionToken = 0

function getEntityId(entity: T): string {
  return props.toKey ? props.toKey(entity) : entity.id
}

function getEntityLabel(entity: T): string {
  return props.toLabel(entity)
}

const selectedEntityIds = computed(() =>
  selectedEntities.value.map(getEntityId)
)

const isBusy = computed(
  () =>
    suggestionState.value === 'loading' || selectionState.value === 'loading'
)

const canClear = computed(() => {
  if (props.readonly) {
    return false
  }

  if (props.multiple) {
    return inputValue.value.trim().length > 0
  }

  return (
    inputValue.value.trim().length > 0 ||
    (selectedEntities.value.length > 0 && !props.multiple)
  )
})

const visibleSuggestions = computed(() => {
  if (!props.multiple) {
    return suggestions.value
  }

  const selectedIds = new Set(selectedEntityIds.value)

  return suggestions.value.filter(
    (entity) => !selectedIds.has(getEntityId(entity))
  )
})

const debouncedSuggestionsLoad = debounce((query: string) => {
  void fetchSuggestions(query)
}, 250)

onClickOutside(rootRef, () => {
  closeFlyout()
})

onBeforeUnmount(() => {
  debouncedSuggestionsLoad.cancel()
})

watch(
  () => inputValue.value,
  (value) => {
    if (!isFlyoutOpen.value || props.readonly) {
      return
    }

    highlightedSuggestionIndex.value = -1
    debouncedSuggestionsLoad(value)
  }
)

watch(
  [() => props.multiple, () => model.value, () => idsModel.value],
  () => {
    void syncFromExternalModels()
  },
  {
    immediate: true,
    deep: true
  }
)

function uniqueIds(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((entry): entry is string => Boolean(entry)))]
}

function cacheEntries(entities: T[]): void {
  if (!entities.length) {
    return
  }

  const nextCache = { ...cachedEntities.value }

  for (const entity of entities) {
    nextCache[getEntityId(entity)] = entity
  }

  cachedEntities.value = nextCache
}

function normalizeEntities(entities: T[]): T[] {
  const map = new Map<string, T>()

  for (const entity of entities) {
    const id = getEntityId(entity)

    if (!map.has(id)) {
      map.set(id, entity)
    }
  }

  return [...map.values()]
}

function hasSameSelection(left: T[], right: T[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every(
    (entry, index) =>
      right[index] && getEntityId(entry) === getEntityId(right[index])
  )
}

function syncModelsFromSelection(): void {
  const normalized = normalizeEntities(selectedEntities.value)
  const normalizedSelection = props.multiple
    ? normalized
    : normalized.slice(0, 1)

  selectedEntities.value = normalizedSelection
  cacheEntries(normalizedSelection)

  isApplyingInternalSync.value = true

  if (props.multiple) {
    model.value = [...normalizedSelection]
    idsModel.value = normalizedSelection.map(getEntityId)
  } else {
    const single = normalizedSelection[0] ?? null

    model.value = single
    idsModel.value = single ? getEntityId(single) : null
  }

  setTimeout(() => {
    isApplyingInternalSync.value = false
  }, 0)
}

async function resolveEntitiesByIds(ids: string[]): Promise<T[]> {
  if (!ids.length) {
    selectionState.value = 'idle'

    return []
  }

  const missingIds = ids.filter((id) => !cachedEntities.value[id])

  if (missingIds.length > 0) {
    if (!props.resolve) {
      selectionState.value = 'idle'

      return ids
        .map((id) => cachedEntities.value[id])
        .filter((entity): entity is T => Boolean(entity))
    }

    selectionState.value = 'loading'

    try {
      const resolved = await props.resolve(missingIds)

      cacheEntries(resolved)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      selectionState.value = 'error'

      return []
    }
  }

  selectionState.value = 'idle'

  const result: T[] = []

  for (const id of ids) {
    if (cachedEntities.value[id]) {
      result.push(cachedEntities.value[id])
    }
  }

  return normalizeEntities(result)
}

async function syncFromExternalModels(): Promise<void> {
  if (isApplyingInternalSync.value) {
    return
  }

  const token = ++externalSyncToken
  let nextSelection: T[] = []

  const currentModel = model.value
  const currentIds = idsModel.value

  let entitiesFromModel: T[] = []
  let idsFromModel: string[] = []

  if (Array.isArray(currentModel)) {
    entitiesFromModel = currentModel
  } else if (currentModel) {
    entitiesFromModel = [currentModel]
  }

  if (Array.isArray(currentIds)) {
    idsFromModel = currentIds
  } else if (currentIds) {
    idsFromModel = [currentIds]
  }

  cacheEntries(entitiesFromModel)

  // idsModel is only used for initial hydration (when binding v-model:ids without v-model).
  // Once a selection exists, model is the source of truth — stale idsModel values are ignored.
  const useIdsModel =
    entitiesFromModel.length === 0 && selectedEntities.value.length === 0

  const allIds = uniqueIds([
    ...entitiesFromModel.map(getEntityId),
    ...(useIdsModel ? idsFromModel : [])
  ])

  if (allIds.length) {
    nextSelection = await resolveEntitiesByIds(allIds)
  } else {
    nextSelection = []
    selectionState.value = 'idle'
  }

  if (token !== externalSyncToken) {
    return
  }

  if (!hasSameSelection(selectedEntities.value, nextSelection)) {
    selectedEntities.value = nextSelection
  }

  if (!props.multiple && selectedEntities.value.length > 0) {
    inputValue.value = ''
  }
}

async function fetchSuggestions(search: string): Promise<void> {
  const token = ++suggestionToken

  suggestionState.value = 'loading'

  try {
    const results = await props.fetch(search)

    if (token !== suggestionToken) {
      return
    }

    cacheEntries(results)
    suggestions.value = results
    suggestionState.value = 'loaded'

    if (highlightedSuggestionIndex.value >= visibleSuggestions.value.length) {
      highlightedSuggestionIndex.value = -1
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    if (token !== suggestionToken) {
      return
    }
    suggestionState.value = 'error'
    suggestions.value = []
  }
}

function openFlyout(): void {
  if (props.readonly) {
    return
  }

  isFlyoutOpen.value = true
  highlightedSuggestionIndex.value = -1
  debouncedSuggestionsLoad.cancel()
  void fetchSuggestions(inputValue.value)
}

function closeFlyout(): void {
  if (!isFlyoutOpen.value) {
    return
  }

  isFlyoutOpen.value = false
  highlightedSuggestionIndex.value = -1
  debouncedSuggestionsLoad.cancel()

  if (!props.multiple) {
    inputValue.value = ''
  }
}

function focusInput(): void {
  inputRef.value?.focus()
}

function selectEntity(entity: T): void {
  if (props.readonly) {
    return
  }

  if (props.multiple) {
    const id = getEntityId(entity)

    if (selectedEntities.value.some((entry) => getEntityId(entry) === id)) {
      return
    }

    selectedEntities.value = [...selectedEntities.value, entity]
    inputValue.value = ''
    highlightedSuggestionIndex.value = -1
    syncModelsFromSelection()
    void fetchSuggestions('')
    inputRef.value?.focus()

    return
  }

  selectedEntities.value = [entity]
  inputValue.value = ''
  syncModelsFromSelection()
  closeFlyout()
}

function removeEntity(id: string): void {
  if (props.readonly) {
    return
  }

  selectedEntities.value = selectedEntities.value.filter(
    (entity) => getEntityId(entity) !== id
  )
  syncModelsFromSelection()

  if (!props.multiple) {
    inputValue.value = ''
    openFlyout()
    inputRef.value?.focus()
  }
}

function clearControl(): void {
  if (props.readonly) {
    return
  }

  if (props.multiple) {
    inputValue.value = ''
    highlightedSuggestionIndex.value = -1
    void fetchSuggestions('')

    return
  }

  selectedEntities.value = []
  inputValue.value = ''
  syncModelsFromSelection()
  openFlyout()
}

function isEntitySelected(id: string): boolean {
  return selectedEntities.value.some((entry) => getEntityId(entry) === id)
}

function moveHighlight(direction: 1 | -1): void {
  const availableSuggestions = visibleSuggestions.value

  if (!availableSuggestions.length) {
    highlightedSuggestionIndex.value = -1

    return
  }

  if (highlightedSuggestionIndex.value === -1) {
    highlightedSuggestionIndex.value =
      direction === 1 ? 0 : availableSuggestions.length - 1

    return
  }

  const maxIndex = availableSuggestions.length - 1
  const nextIndex = highlightedSuggestionIndex.value + direction

  if (nextIndex > maxIndex) {
    highlightedSuggestionIndex.value = 0

    return
  }

  if (nextIndex < 0) {
    highlightedSuggestionIndex.value = maxIndex

    return
  }

  highlightedSuggestionIndex.value = nextIndex
}

function onInputKeydown(event: KeyboardEvent): void {
  if (props.readonly) {
    return
  }

  if (event.key === 'Escape') {
    closeFlyout()

    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isFlyoutOpen.value) {
      openFlyout()
    }
    moveHighlight(1)

    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isFlyoutOpen.value) {
      openFlyout()
    }
    moveHighlight(-1)

    return
  }

  if (
    event.key === 'Backspace' &&
    !inputValue.value &&
    selectedEntities.value.length &&
    props.multiple
  ) {
    const last = selectedEntities.value[selectedEntities.value.length - 1]

    removeEntity(getEntityId(last))

    return
  }

  if (event.key !== 'Enter' || !isFlyoutOpen.value) {
    return
  }

  const suggestionsToSelectFrom = visibleSuggestions.value

  if (!suggestionsToSelectFrom.length || suggestionState.value !== 'loaded') {
    return
  }

  event.preventDefault()

  const targetIndex =
    highlightedSuggestionIndex.value >= 0 ? highlightedSuggestionIndex.value : 0
  const entity = suggestionsToSelectFrom[targetIndex]

  if (!entity) {
    return
  }

  selectEntity(entity)
}

function retrySuggestionsLoad(): void {
  void fetchSuggestions(inputValue.value)
}

function retrySelectionLoad(): void {
  void syncFromExternalModels()
}
</script>

<style scoped lang="sass">
@use "../noo-input.sass"

.noo-entity-select
  &__container
    position: relative

  &__control
    min-height: 2.4em
    width: 100%
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    background: var(--form-background)
    color: var(--form-text-color)
    box-sizing: border-box
    display: flex
    align-items: center
    gap: 0.5em
    padding: 0.2em 0.8em
    cursor: text
    flex-wrap: nowrap

    &--focused
      border-color: var(--primary)

    &--error
      border-color: var(--danger)

    &--readonly
      background: var(--light)
      opacity: 0.7
      cursor: default

  &__chips
    display: flex
    flex-wrap: wrap
    gap: 0.4em
    margin: 0.2em 0

  &__chip
    display: inline-flex
    align-items: center
    text-align: left
    gap: 0.4em
    border: none
    border-radius: 0.25rem
    background: var(--light)
    color: var(--form-text-color)
    font-size: 0.8em
    line-height: 1
    padding: 0.3em 0.55em
    cursor: pointer

    &:disabled
      cursor: default

    &__remove
      font-size: 1.3em
      cursor: pointer
      display: flex

  &__input
    border: none
    outline: none
    min-width: 6em
    flex-grow: 1
    width: auto
    padding: 0.3em 0
    font-size: 0.9em
    line-height: 1
    color: var(--form-text-color)
    background: transparent

    &:disabled
      cursor: not-allowed

  &__actions
    display: flex
    align-items: center
    justify-content: center
    margin-left: auto
    flex-shrink: 0

  &__icon
    font-size: 1.5em
    color: var(--text-light)
    display: flex

    &--clickable
      cursor: pointer
      transition: transform 0.2s ease-in-out

      &:hover
        --form-text-color: var(--danger)

  &__flyout
    position: absolute
    top: calc(100% + 0.25em)
    left: 0
    right: 0
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    background: var(--form-background)
    box-shadow: var(--block-shadow)
    overflow: hidden
    z-index: 4

  &__state
    display: flex
    align-items: center
    gap: 0.5em
    font-size: 0.8em
    line-height: 1.2em
    color: var(--text-light)
    padding: 0.7em 0.8em

    &--error
      color: var(--danger)

  &__retry
    cursor: pointer
    text-decoration: underline
    margin-left: 0.2em

    &:hover
      color: var(--text-light)

  &__suggestions
    list-style: none
    padding: 0.3em 0
    margin: 0
    max-height: 16em
    overflow: auto

  &__suggestion
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.8em
    padding: 0.45em 0.8em
    cursor: pointer
    font-size: 0.9em
    line-height: 1.2em
    color: var(--form-text-color)

    &:hover
      background: var(--light)

    &--highlighted
      background: var(--light)

    &--selected
      background: var(--light)

    &__title
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
      max-width: 80%

  &__selection-error
    margin-top: 0.3em
    color: var(--danger)
    font-size: 0.8em
    line-height: 1.1em
</style>
