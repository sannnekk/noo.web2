<template>
  <noo-base-modal
    v-if="props.workId"
    v-model:is-open="isOpen"
    close-on-esc
    close-on-outside-click
    full-width
  >
    <template #title>
      <noo-title
        :size="5"
        no-margin
      >
        Статистика работы
      </noo-title>
      <noo-title :size="3">
        {{
          workStatistics.isLoading.value
            ? 'Загрузка...'
            : workStatistics.data.value?.work?.title
        }}
      </noo-title>
    </template>
    <template #content>
      <div
        v-if="workStatistics.isLoading.value"
        class="work-statistics-modal__loading"
      >
        <noo-loader-icon contrast />
      </div>

      <div
        v-else-if="workStatistics.error.value"
        class="work-statistics-modal__error"
      >
        <noo-error-block
          with-image
          centered
          :try-again="
            () => (workId ? workStatistics.execute(workId) : undefined)
          "
        >
          <noo-title :size="4">
            Не удалось загрузить статистику работы
          </noo-title>
        </noo-error-block>
      </div>

      <!-- TODO: these cards are similar to user statistics cards, so add a component for them -->
      <noo-grid-layout
        v-else-if="workStatistics.data.value"
        :cols="3"
        gap="0.5em"
      >
        <noo-grid-layout-item
          :col="1"
          :row="1"
          horizontal-align="stretch"
        >
          <div class="work-statistics-modal__stat-item">
            <div class="work-statistics-modal__stat-item__numbers">
              <div class="work-statistics-modal__stat-item__number">
                {{ workStatistics.data.value?.workSolveCount ?? '-' }}
              </div>
            </div>
            <noo-text-block
              dimmed
              no-margin
            >
              Всего решено
            </noo-text-block>
          </div>
        </noo-grid-layout-item>

        <noo-grid-layout-item
          :col="2"
          :row="1"
          horizontal-align="stretch"
        >
          <div class="work-statistics-modal__stat-item">
            <div class="work-statistics-modal__stat-item__numbers">
              <div class="work-statistics-modal__stat-item__number">
                {{
                  workStatistics.data.value?.averageWorkScore.absolute ?? '-'
                }}
              </div>
              <div class="work-statistics-modal__stat-item__number--dimmed">
                {{
                  workStatistics.data.value?.averageWorkScore.percentage
                    ? `(${workStatistics.data.value?.averageWorkScore.percentage}%)`
                    : '-%'
                }}
              </div>
            </div>
            <noo-text-block
              dimmed
              no-margin
            >
              Средний балл
            </noo-text-block>
          </div>
        </noo-grid-layout-item>

        <noo-grid-layout-item
          :col="3"
          :row="1"
          horizontal-align="stretch"
        >
          <div class="work-statistics-modal__stat-item">
            <div class="work-statistics-modal__stat-item__numbers">
              <div class="work-statistics-modal__stat-item__number">
                {{ workStatistics.data.value?.medianWorkScore.absolute ?? '-' }}
              </div>
              <div class="work-statistics-modal__stat-item__number--dimmed">
                {{
                  workStatistics.data.value?.medianWorkScore.percentage
                    ? `(${workStatistics.data.value?.medianWorkScore.percentage}%)`
                    : '-%'
                }}
              </div>
            </div>
            <noo-text-block
              dimmed
              no-margin
            >
              Медианный балл
            </noo-text-block>
          </div>
        </noo-grid-layout-item>

        <noo-grid-layout-item
          :col="1"
          :row="2"
          :colspan="3"
          horizontal-align="stretch"
        >
          <noo-distribution
            label="Распределение заданий по проценту от максимального балла"
            :data="distributionData"
            unit="%"
            x-label="% от максимального балла"
            y-label="Количество заданий"
          />
        </noo-grid-layout-item>

        <noo-grid-layout-item
          :col="1"
          :row="3"
          :colspan="3"
          horizontal-align="stretch"
        >
          <noo-text-block dimmed>
            Топ-5 самых сложных заданий (по проценту от максимального балла)
          </noo-text-block>
          <noo-entity-table
            :columns="columns"
            :data="hardestTasks"
          >
            <template #column-averageScore="{ item }">
              {{ item.averageScore ?? '—' }}
            </template>
            <template #column-scorePercentage="{ item }">
              {{
                item.scorePercentage !== null ? `${item.scorePercentage}%` : '—'
              }}
            </template>
            <template #column-link="{ item }">
              <noo-inline-link
                size="small"
                :to="{
                  name: 'works.edit',
                  params: { workId: props.workId },
                  query: { taskId: item.id }
                }"
              >
                Открыть задание №{{ item.order }}
              </noo-inline-link>
            </template>
          </noo-entity-table>
        </noo-grid-layout-item>
      </noo-grid-layout>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="secondary"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import { useApiRequest } from '@/core/composables/useApiRequest'
import type { WorkEntity, WorkTaskEntity } from '../api/work.types'
import { WorkService } from '../api/work.service'
import { computed, watch } from 'vue'
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { DistributionEntry } from '@/components/charts/noo-distribution.vue'
import type { ApiEntity } from '@/core/api/api.types'

interface Props {
  workId: WorkEntity['id'] | null
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const TOP_HARDEST_COUNT = 5

const workStatistics = useApiRequest(WorkService.getStatisticsById)

watch(
  () => props.workId,
  async (workId) => {
    if (!workId) {
      return
    }

    await workStatistics.execute(workId)
  },
  {
    immediate: true
  }
)

/**
 * A single row of the "hardest tasks" table: the task enriched with the
 * aggregated scoring data coming from the statistics endpoint.
 */
interface HardestTaskRow extends ApiEntity<'WorkTask'> {
  order: number
  maxScore: number
  averageScore: number | null
  scorePercentage: number | null
}

const tasksById = computed(() => {
  const map = new Map<WorkTaskEntity['id'], WorkTaskEntity>()

  for (const task of workStatistics.data.value?.work.tasks ?? []) {
    map.set(task.id, task)
  }

  return map
})

/**
 * Average score as a percentage of the maximum, rounded to one decimal point,
 * so that tasks with different maximum scores stay comparable.
 */
function toScorePercentage(
  avgScore: number | null,
  maxScore: number
): number | null {
  if (avgScore === null || maxScore <= 0) {
    return null
  }

  return Math.round((avgScore / maxScore) * 1000) / 10
}

const distributionData = computed<DistributionEntry<WorkTaskEntity>[]>(() =>
  (workStatistics.data.value?.taskSummaries ?? [])
    .map((summary): DistributionEntry<WorkTaskEntity> | null => {
      const scorePercentage = toScorePercentage(
        summary.averageScore,
        summary.maxScore
      )

      if (scorePercentage === null) {
        return null
      }

      const task = tasksById.value.get(summary.taskId)

      return {
        value: scorePercentage,
        label: task ? `Задание №${task.order}` : 'Задание',
        item: task
      }
    })
    .filter(
      (entry): entry is DistributionEntry<WorkTaskEntity> => entry !== null
    )
)

const hardestTasks = computed<HardestTaskRow[]>(() =>
  (workStatistics.data.value?.taskSummaries ?? [])
    .map((summary): HardestTaskRow => {
      const task = tasksById.value.get(summary.taskId)

      return {
        _entityName: 'WorkTask',
        id: summary.taskId,
        createdAt: task?.createdAt ?? new Date(),
        updatedAt: task?.updatedAt ?? null,
        order: task?.order ?? 0,
        maxScore: summary.maxScore,
        averageScore: summary.averageScore,
        scorePercentage: toScorePercentage(
          summary.averageScore,
          summary.maxScore
        )
      }
    })
    .sort((a, b) => {
      // Hardest first: the lowest percentage on top, unscored tasks last.
      if (a.scorePercentage === null) {
        return 1
      }

      if (b.scorePercentage === null) {
        return -1
      }

      return a.scorePercentage - b.scorePercentage
    })
    .slice(0, TOP_HARDEST_COUNT)
)

const columns: EntityTableColumnType<HardestTaskRow>[] = [
  {
    key: 'order',
    title: '№',
    width: '4em'
  },
  {
    key: 'maxScore',
    title: 'Макс. балл'
  },
  {
    key: 'averageScore',
    title: 'Средний балл'
  },
  {
    key: 'scorePercentage',
    title: '% от макс.'
  },
  {
    key: 'link',
    title: '',
    disableLink: true
  }
]
</script>

<style scoped lang="sass">
.work-statistics-modal
  &__stat-item
    padding: 1em
    border-radius: var(--border-radius)
    background-color: var(--light-background-color)
    display: flex
    flex-direction: column
    gap: 0.25em

    &__numbers
      display: flex
      align-items: baseline
      gap: 0.35em

    &__number
      font-size: 1.8em
      font-weight: 600
      line-height: 1.4

      &--dimmed
        font-size: 1em
        color: var(--text-light)

  &__loading,
  &__error
    display: flex
    align-items: center
    justify-content: center
    padding: 3em 1em
</style>
