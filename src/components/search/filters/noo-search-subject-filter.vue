<template>
  <div class="noo-search-subject-filter">
    <div
      v-if="state === 'loaded'"
      class="noo-search-subject-filter__content"
    >
      <noo-multi-select
        v-model="selectedIds"
        :label="label"
        :options="subjectOptions"
        expandable
      />
    </div>
    <div
      v-else-if="state === 'loading'"
      class="noo-search-subject-filter__loading"
    >
      <noo-input-skeleton />
    </div>
    <div
      v-else-if="state === 'empty'"
      class="noo-search-subject-filter__empty"
    >
      Список предметов пуст.
    </div>
    <div
      v-else
      class="noo-search-subject-filter__error"
    >
      Не удалось загрузить предметы.
      <span
        class="noo-search-subject-filter__retry"
        @click="loadSubjects"
      >
        Повторить
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrayFilter, type IFilter } from '@/core/utils/pagination.utils'
import { SubjectService } from '@/modules/subjects/api/subject.service'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import {
  type FilterCtor,
  findFilterOfType,
  setFilter
} from './search-filters.utils'

interface Props {
  label?: string
  filterKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Предметы',
  filterKey: 'subjectId'
})

const filtersModel = defineModel<IFilter[] | undefined>('filters', {
  default: undefined
})

const subjects = shallowRef<SubjectEntity[]>([])
const selectedIds = ref<string[]>([])
const state = shallowRef<'loading' | 'loaded' | 'error' | 'empty'>('loading')

const subjectOptions = computed(() =>
  subjects.value.map((subject) => ({
    label: subject.name ?? '- ',
    value: subject.id
  }))
)

let isSyncing = false

watch(
  () => filtersModel.value,
  (filters) => {
    const current = findFilterOfType(
      filters,
      props.filterKey,
      ArrayFilter as FilterCtor<ArrayFilter<string>>
    )

    isSyncing = true

    selectedIds.value = current?.getValue().map((value) => String(value)) ?? []

    nextTick(() => {
      isSyncing = false
    })
  },
  { immediate: true, deep: true }
)

watch(
  () => selectedIds.value,
  (value) => {
    if (isSyncing) {
      return
    }

    if (!value.length) {
      filtersModel.value = setFilter(filtersModel.value, props.filterKey, null)

      return
    }

    filtersModel.value = setFilter(
      filtersModel.value,
      props.filterKey,
      new ArrayFilter(props.filterKey, value)
    )
  },
  { deep: true }
)

onMounted(loadSubjects)

async function loadSubjects() {
  state.value = 'loading'

  const response = await SubjectService.get()

  if (response.data?.length) {
    subjects.value = response.data
    state.value = 'loaded'
  } else if (response.error) {
    state.value = 'error'
  } else {
    state.value = 'empty'
  }
}
</script>

<style scoped lang="sass">
.noo-search-subject-filter
  &__loading
    min-height: 5em

  &__empty
    color: var(--text-light)
    font-size: 0.8em

  &__error
    color: var(--danger)
    font-size: 0.8em

  &__retry
    text-decoration: underline
    cursor: pointer

    &:hover
      color: var(--text-light)
</style>
