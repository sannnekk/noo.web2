<template>
  <noo-section
    :title="block.title"
    :description="block.description ?? undefined"
  >
    <div class="statistics-block">
      <ul
        v-if="block.numberBlocks.length"
        class="statistics-block__numbers"
      >
        <li
          v-for="(numberBlock, index) in block.numberBlocks"
          :key="`${numberBlock.title}-${index}`"
          class="statistics-block__number"
        >
          <noo-text-block
            class="statistics-block__number__title"
            size="small"
            no-margin
          >
            {{ numberBlock.title }}
          </noo-text-block>
          <div class="statistics-block__number__value">
            <span class="statistics-block__number__value__number">
              {{ formatValue(numberBlock.value) }}
            </span>
            <span
              v-if="numberBlock.units"
              class="statistics-block__number__value__units"
            >
              {{ numberBlock.units }}
            </span>
          </div>
          <noo-text-block
            v-if="numberBlock.description"
            class="statistics-block__number__description"
            size="small"
            dimmed
            no-margin
          >
            {{ numberBlock.description }}
          </noo-text-block>
          <ul
            v-if="hasSubValues(numberBlock.subValues)"
            class="statistics-block__number__sub-values"
          >
            <li
              v-for="(subValue, subKey) in numberBlock.subValues ?? {}"
              :key="subKey"
              class="statistics-block__number__sub-value"
            >
              <span class="statistics-block__number__sub-value__label">
                {{ subKey }}
              </span>
              <span class="statistics-block__number__sub-value__value">
                {{ formatValue(subValue) }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
      <div
        v-if="block.graph"
        class="statistics-block__graph"
      >
        <noo-title
          v-if="block.graph.label"
          :size="4"
        >
          {{ block.graph.label }}
        </noo-title>
        <noo-line-chart
          :data="lineChartData"
          :key-type="graphKeyType"
          :height="350"
        />
      </div>
    </div>
  </noo-section>
</template>

<script setup lang="ts">
import type {
  LineChartData,
  LineChartKeyType
} from '@/components/charts/noo-line-chart.vue'
import { isIsoDateString } from '@/core/api/serialization.utils'
import { computed } from 'vue'
import type { StatisticsBlockDto } from '../api/statistics.types'

interface Props {
  block: StatisticsBlockDto
}

const props = defineProps<Props>()

const palette = [
  'var(--primary)',
  'var(--secondary)',
  'var(--lila)',
  'var(--warning)',
  'var(--danger)',
  'var(--info)',
  'var(--success)'
]

const graphKeyType = computed<LineChartKeyType>(() => {
  const graph = props.block.graph

  if (!graph) {
    return 'string'
  }

  for (const line of graph.lines) {
    for (const key of Object.keys(line.values)) {
      if (isIsoDateString(key)) {
        return 'date'
      }

      if (!Number.isNaN(Number(key))) {
        return 'number'
      }

      return 'string'
    }
  }

  return 'string'
})

const lineChartData = computed<LineChartData[]>(() => {
  const graph = props.block.graph

  if (!graph) {
    return []
  }

  return graph.lines.map((line, index) => ({
    key: `${index}-${line.name}`,
    name: line.name,
    color: palette[index % palette.length],
    entries: Object.fromEntries(
      Object.entries(line.values)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => [key, { value: value! }])
    )
  }))
})

function formatValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function hasSubValues(
  subValues: Record<string, number | null> | null | undefined
): boolean {
  return !!subValues && Object.keys(subValues).length > 0
}
</script>

<style scoped lang="sass">
.statistics-block
  display: flex
  flex-direction: column
  gap: 1.5em

  &__numbers
    list-style: none
    margin: 0
    padding: 0
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))
    gap: 1em

  &__number
    padding: 1em
    border-radius: var(--border-radius)
    background-color: var(--light-background-color)
    display: flex
    flex-direction: column
    gap: 0.25em
    height: fit-content

    &__value
      display: flex
      align-items: baseline
      gap: 0.25em

      &__number
        font-size: 1.8em
        font-weight: 600
        line-height: 1.4

      &__units
        font-size: 0.9em
        color: var(--form-text-color)

    &__sub-values
      list-style: none
      margin: 0.5em 0 0
      padding: 0
      display: flex
      flex-direction: column
      gap: 0.15em

    &__sub-value
      display: flex
      justify-content: space-between
      gap: 0.5em
      font-size: 0.85em
      color: var(--text-light)

  &__graph
    display: flex
    flex-direction: column
    gap: 0.5em
</style>
