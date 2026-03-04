<template>
  <div class="line-chart">
    <VisBulletLegend :items="legendItems" />
    <VisXYContainer
      :height="height"
      :data="chartData"
    >
      <VisLine
        v-for="(accessor, idx) in lineAccessors"
        :key="keys[idx]"
        :x="xAccessor"
        :y="accessor"
        :color="lineColors[idx]"
      />
      <VisAxis
        type="x"
        :label="xLabel"
        :tick-format="xTickFormat"
        :num-ticks="xLabels.length"
        :tick-text-hide-overlapping="true"
      />
      <VisAxis
        type="y"
        :label="yLabel"
      />
      <VisCrosshair :template="crosshairTemplate" />
      <VisTooltip />
    </VisXYContainer>
  </div>
</template>

<script lang="ts" setup>
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisBulletLegend,
  VisCrosshair,
  VisTooltip
} from '@unovis/vue'
import { computed } from 'vue'
import { DateHelpers } from '@/core/utils/dates'

export type LineChartKeyType = 'string' | 'number' | 'date'

interface EntryValue {
  value: number
  hint?: string
}

export interface LineChartData {
  key: string
  name: string
  description?: string
  color?: string
  entries: Record<string | number, EntryValue>
}

type ChartRecord = Record<string, number | string>

interface Props {
  data: LineChartData[]
  keyType?: LineChartKeyType
  xLabel?: string
  yLabel?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  keyType: 'string'
})

function formatLabel(raw: string): string {
  if (props.keyType === 'date') {
    return DateHelpers.formatDate(raw)
  }

  return raw
}

function sortLabels(labels: string[]): string[] {
  if (props.keyType === 'date') {
    return labels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }

  if (props.keyType === 'number') {
    return labels.sort((a, b) => Number(a) - Number(b))
  }

  return labels
}

const xLabels = computed(() => {
  const labelSet = new Set<string>()

  for (const series of props.data) {
    for (const key of Object.keys(series.entries)) {
      labelSet.add(String(key))
    }
  }

  return sortLabels(Array.from(labelSet))
})

const chartData = computed<ChartRecord[]>(() => {
  return xLabels.value.map((label) => {
    const record: ChartRecord = { label }

    for (const series of props.data) {
      const entry = series.entries[label]

      record[series.key] = entry?.value ?? 0
    }

    return record
  })
})

const keys = computed(() => props.data.map((d) => d.key))

const lineColors = computed(() => props.data.map((d) => d.color ?? undefined))

const legendItems = computed(() =>
  props.data.map((d) => ({
    name: d.name,
    color: d.color
  }))
)

const xAccessor = (_d: ChartRecord, i: number) => i

const lineAccessors = computed(() =>
  keys.value.map((k) => (d: ChartRecord) => (d[k] as number) ?? 0)
)

const xTickFormat = (i: number) => formatLabel(xLabels.value[i] ?? '')

const crosshairTemplate = (d: ChartRecord) => {
  const label = formatLabel(d.label as string)

  return [
    `<b>${label}</b>`,
    ...keys.value.map((k, idx) => {
      const series = props.data[idx]

      return `${series?.name ?? k}: ${d[k] ?? 0}`
    })
  ].join('<br>')
}
</script>

<style lang="sass" scoped>
.line-chart
  --vis-axis-grid-color: var(--grid-color)
  --vis-axis-tick-color: var(--grid-color)
  --vis-axis-tick-label-color: var(--text-light)
  --vis-tooltip-background-color: var(--form-background)
  --vis-tooltip-text-color: var(--form-text-color)
  --vis-tooltip-border-color: transparent
</style>
