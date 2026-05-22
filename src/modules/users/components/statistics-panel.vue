<template>
  <div class="statistics-panel">
    <div class="statistics-panel__filters">
      <noo-work-type-select v-model="filters.workType" />
      <noo-date-input
        v-model="filters.from"
        label="С"
        resettable
      />
      <noo-date-input
        v-model="filters.to"
        label="По"
        resettable
      />
    </div>
    <div
      v-if="statistics.isLoading.value"
      class="statistics-panel__loading"
    >
      <noo-loader-icon contrast />
    </div>
    <noo-error-block
      v-else-if="statistics.error.value"
      no-margin
      with-image
      :try-again="reload"
    >
      <noo-title :size="4">Не удалось загрузить статистику</noo-title>
    </noo-error-block>
    <noo-text-block
      v-else-if="!blocks.length"
      dimmed
    >
      По выбранным параметрам данных нет.
    </noo-text-block>
    <div
      v-else
      class="statistics-panel__blocks"
    >
      <statistics-block
        v-for="(block, index) in blocks"
        :key="`${block.title}-${index}`"
        :block="block"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { UserRole } from '@/core/api/endpoints/auth.types'
import type { WorkType } from '@/modules/works/api/work.types'
import { computed, reactive, watch } from 'vue'
import { StatisticsService } from '../api/statistics.service'
import type { StatisticsDto, StatisticsQuery } from '../api/statistics.types'
import StatisticsBlock from './statistics-block.vue'

interface Props {
  /**
   * The id of the user whose statistics to load. When omitted (or when the
   * role is not student/mentor), platform-wide statistics are loaded instead.
   */
  userId?: string | null
  /**
   * The role of the user being displayed. Used to choose between the
   * user-specific and the platform statistics endpoints.
   */
  userRole?: UserRole | null
}

interface Filters {
  workType: WorkType | null
  from: Date | null
  to: Date | null
}

const props = withDefaults(defineProps<Props>(), {
  userId: null,
  userRole: null
})

const uiStore = useGlobalUIStore()

const filters = reactive<Filters>({
  workType: 'test',
  from: getDefaultFromDate(),
  to: new Date()
})

const usesUserEndpoint = computed<boolean>(
  () => props.userRole === 'student' || props.userRole === 'mentor'
)

const statistics = useApiRequest<void, StatisticsDto>(
  () => {
    const query: StatisticsQuery = {
      workType: filters.workType ?? undefined,
      from: filters.from ?? undefined,
      to: filters.to ?? undefined
    }

    if (usesUserEndpoint.value && props.userId) {
      return StatisticsService.getForUser(props.userId, query)
    }

    return StatisticsService.getForPlatform(query)
  },
  undefined,
  (error) =>
    uiStore.createApiErrorToast('Не удалось загрузить статистику', error)
)

const blocks = computed(() => statistics.data.value?.blocks ?? [])

async function reload(): Promise<void> {
  await statistics.execute()
}

function getDefaultFromDate(): Date {
  const today = new Date()
  const result = new Date(today.getFullYear(), today.getMonth(), 17)

  if (today.getDate() < 17) {
    result.setMonth(result.getMonth() - 1)
  }

  return result
}

watch(
  [
    () => props.userId,
    () => props.userRole,
    () => filters.workType,
    () => filters.from,
    () => filters.to
  ],
  () => {
    reload()
  },
  { immediate: true }
)
</script>

<style scoped lang="sass">
.statistics-panel
  padding: 1em 0

  &__filters
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
    gap: 1em
    align-items: end

  &__loading
    display: flex
    justify-content: center
    font-size: 2em

  &__blocks
    display: flex
    flex-direction: column
    gap: 2em
</style>
