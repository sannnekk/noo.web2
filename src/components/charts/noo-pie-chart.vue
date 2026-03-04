<template>
  <div class="pie-chart">
    <VisBulletLegend :items="legendItems" />
    <VisSingleContainer :height="height">
      <VisDonut
        :data="chartData"
        :value="valueAccessor"
        :color="colorAccessor"
        :arc-width="arcWidth"
        :pad-angle="0.02"
        :corner-radius="4"
        :central-label="centralLabel"
      />
      <VisTooltip :triggers="tooltipTriggers" />
    </VisSingleContainer>
  </div>
</template>

<script lang="ts" setup>
import {
  VisSingleContainer,
  VisDonut,
  VisTooltip,
  VisBulletLegend
} from '@unovis/vue'
import { Donut } from '@unovis/ts'
import { computed } from 'vue'

export interface PieChartEntry {
  label: string
  value: number
  color?: string
}

interface Props {
  data: PieChartEntry[]
  height?: number
  arcWidth?: number
  centralLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  arcWidth: 60
})

const chartData = computed(() => props.data)

const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

const legendItems = computed(() =>
  props.data.map((d) => ({
    name: `${d.label} (${total.value ? Math.round((d.value / total.value) * 100) : 0}%)`,
    color: d.color
  }))
)

const valueAccessor = (d: PieChartEntry) => d.value

const colors = computed(
  () => props.data.map((d) => d.color).filter(Boolean) as string[]
)

const colorAccessor = computed(() =>
  colors.value.length > 0
    ? (_d: PieChartEntry, i: number) => colors.value[i]
    : undefined
)

const tooltipTriggers = computed(() => ({
  [Donut.selectors.segment]: (d: PieChartEntry) => {
    const percent = total.value ? Math.round((d.value / total.value) * 100) : 0

    return `<b>${d.label}</b><br>${d.value} (${percent}%)`
  }
}))
</script>

<style lang="sass" scoped>
.pie-chart
  --vis-tooltip-background-color: var(--form-background)
  --vis-tooltip-text-color: var(--form-text-color)
  --vis-tooltip-border-color: transparent
</style>
