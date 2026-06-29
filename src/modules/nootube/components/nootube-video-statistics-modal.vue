<template>
  <noo-base-modal
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
        Статистика видео
      </noo-title>
      <noo-title :size="3">
        {{ video?.title }}
      </noo-title>
    </template>
    <template #content>
      <div class="nootube-video-statistics-modal__filters">
        <noo-date-input
          v-model="filters.from"
          label="С"
        />
        <noo-date-input
          v-model="filters.to"
          label="По"
        />
      </div>

      <div
        v-if="statistics.isLoading.value"
        class="nootube-video-statistics-modal__loading"
      >
        <noo-loader-icon contrast />
      </div>

      <div
        v-else-if="statistics.error.value"
        class="nootube-video-statistics-modal__error"
      >
        <noo-error-block
          with-image
          centered
          :try-again="reload"
        >
          <noo-title :size="4">
            Не удалось загрузить статистику видео
          </noo-title>
        </noo-error-block>
      </div>

      <noo-grid-layout
        v-else-if="statistics.data.value"
        :cols="4"
        gap="0.5em"
      >
        <noo-grid-layout-item
          v-for="(stat, index) in statCards"
          :key="stat.label"
          :col="index + 1"
          :row="1"
          horizontal-align="stretch"
        >
          <div class="nootube-video-statistics-modal__stat-item">
            <div class="nootube-video-statistics-modal__stat-item__number">
              {{ stat.value }}
            </div>
            <noo-text-block
              dimmed
              no-margin
            >
              {{ stat.label }}
            </noo-text-block>
          </div>
        </noo-grid-layout-item>

        <noo-grid-layout-item
          :col="1"
          :row="2"
          :colspan="4"
          horizontal-align="stretch"
        >
          <noo-line-chart
            v-if="hasTimeline"
            :data="timelineChartData"
            key-type="date"
            x-label="Дата"
            y-label="Просмотры"
          />
          <noo-text-block
            v-else
            dimmed
            align="center"
          >
            За выбранный период нет данных о просмотрах.
          </noo-text-block>
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
import { computed, reactive, watch } from 'vue'
import { useApiRequest } from '@/core/composables/useApiRequest'
import type { LineChartData } from '@/components/charts/noo-line-chart.vue'
import { NooTubeService } from '../api/nootube.service'
import type { NooTubeVideoEntity } from '../api/nootube.types'
import { formatVideoDuration } from '../video.utils'

interface Props {
  video: NooTubeVideoEntity | null
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

interface Filters {
  from: Date | null
  to: Date | null
}

const filters = reactive<Filters>(getDefaultPeriod())

const statistics = useApiRequest((videoId: string) =>
  NooTubeService.getStatistics(
    videoId,
    filters.from ?? undefined,
    filters.to ?? undefined
  )
)

function getDefaultPeriod(): Filters {
  const to = new Date()
  const from = new Date(to)

  from.setMonth(from.getMonth() - 1)

  return { from, to }
}

function reload() {
  if (props.video) {
    statistics.execute(props.video.id)
  }
}

watch(
  [
    () => (isOpen.value ? props.video?.id : undefined),
    () => filters.from,
    () => filters.to
  ],
  ([videoId]) => {
    if (videoId) {
      statistics.execute(videoId)
    }
  },
  { immediate: true }
)

const statCards = computed(() => {
  const data = statistics.data.value

  return [
    { label: 'Просмотры', value: data?.views ?? 0 },
    { label: 'Уникальные просмотры', value: data?.uniqueViews ?? 0 },
    {
      label: 'Время просмотра',
      value: formatVideoDuration(data?.watchTimeSeconds ?? null)
    },
    { label: 'Загрузки плеера', value: data?.playerLoads ?? 0 }
  ]
})

const hasTimeline = computed(
  () => (statistics.data.value?.timeline.length ?? 0) > 0
)

const timelineChartData = computed<LineChartData[]>(() => {
  const timeline = statistics.data.value?.timeline ?? []

  const views: LineChartData = {
    key: 'views',
    name: 'Просмотры',
    color: 'var(--lila)',
    entries: {}
  }

  const uniqueViews: LineChartData = {
    key: 'uniqueViews',
    name: 'Уникальные просмотры',
    color: 'var(--success)',
    entries: {}
  }

  for (const point of timeline) {
    const key = new Date(point.date).toISOString()

    views.entries[key] = { value: point.views }
    uniqueViews.entries[key] = { value: point.uniqueViews }
  }

  return [views, uniqueViews]
})
</script>

<style scoped lang="sass">
.nootube-video-statistics-modal
  &__filters
    display: flex
    gap: 0.5em
    flex-wrap: wrap
    margin-bottom: 1em

    > *
      flex: 1 1 12em

  &__stat-item
    padding: 1em
    border-radius: var(--border-radius)
    background-color: var(--light-background-color)
    display: flex
    flex-direction: column
    gap: 0.25em

    &__number
      font-size: 1.8em
      font-weight: 600
      line-height: 1.4

  &__loading,
  &__error
    display: flex
    align-items: center
    justify-content: center
    padding: 3em 1em
</style>
