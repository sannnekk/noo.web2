<template>
  <div class="statistics-distribution">
    <noo-title :size="4">
      {{ distribution.title }}
    </noo-title>
    <noo-text-block
      v-if="distribution.description"
      size="small"
      dimmed
      no-margin
    >
      {{ distribution.description }}
    </noo-text-block>
    <noo-text-block
      v-if="!total"
      dimmed
      no-margin
    >
      Нет данных за выбранный период.
    </noo-text-block>
    <ul
      v-else
      class="statistics-distribution__entries"
    >
      <li
        v-for="entry in entries"
        :key="entry.label"
        class="statistics-distribution__entry"
      >
        <noo-icon
          class="statistics-distribution__entry__icon"
          :name="entry.icon"
        />
        <span class="statistics-distribution__entry__label">
          {{ entry.label }}
        </span>
        <span class="statistics-distribution__entry__value">
          {{ entry.value }}
          <span class="statistics-distribution__entry__value__share">
            {{ entry.share }}%
          </span>
        </span>
        <div class="statistics-distribution__entry__bar">
          <div
            class="statistics-distribution__entry__bar__fill"
            :style="{ width: `${entry.share}%` }"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { IconName } from '@/components/icons/noo-icon.vue'
import { computed } from 'vue'
import type { StatisticsDistributionDto } from '../api/statistics.types'

interface Props {
  distribution: StatisticsDistributionDto
}

interface Entry {
  label: string
  value: number
  share: number
  icon: IconName
}

const props = defineProps<Props>()

/**
 * The API names the icon rather than picking one, so a browser the backend
 * learns about before the frontend does still renders — as the generic one.
 */
const iconNames: Record<string, IconName> = {
  chrome: 'chrome',
  firefox: 'firefox',
  safari: 'safari',
  edge: 'edge',
  opera: 'opera',
  yandex: 'yandex',
  vivaldi: 'browser',
  'samsung-internet': 'browser',
  'internet-explorer': 'browser',
  desktop: 'desktop',
  mobile: 'mobile',
  tablet: 'tablet'
}

const fallbackIconName: IconName = 'question'

const total = computed<number>(() =>
  props.distribution.entries.reduce((sum, entry) => sum + entry.value, 0)
)

const entries = computed<Entry[]>(() =>
  props.distribution.entries.map((entry) => ({
    label: entry.label,
    value: entry.value,
    share: total.value ? Math.round((entry.value / total.value) * 100) : 0,
    icon: (entry.icon ? iconNames[entry.icon] : undefined) ?? fallbackIconName
  }))
)
</script>

<style scoped lang="sass">
.statistics-distribution
  display: flex
  flex-direction: column
  gap: 0.5em

  &__entries
    list-style: none
    margin: 0
    padding: 0
    display: flex
    flex-direction: column
    gap: 0.85em

  &__entry
    display: grid
    grid-template-columns: 1.5em 1fr auto
    grid-template-rows: auto auto
    align-items: center
    column-gap: 0.75em
    row-gap: 0.35em

    &__icon
      grid-row: 1 / span 2
      font-size: 1.5em

    &__label
      font-size: 0.95em

    &__value
      font-variant-numeric: tabular-nums
      font-weight: 600

      &__share
        margin-left: 0.4em
        font-weight: 400
        color: var(--text-light)

    &__bar
      grid-column: 2 / span 2
      height: 0.5em
      border-radius: var(--border-radius)
      background-color: var(--light-background-color)
      overflow: hidden

      &__fill
        height: 100%
        border-radius: inherit
        background-color: var(--primary)
        transition: width 0.2s ease-in-out
</style>
