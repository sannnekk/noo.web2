<template>
  <div class="distribution">
    <noo-text-block
      v-if="label"
      dimmed
      class="distribution__label"
    >
      {{ label }}
    </noo-text-block>
    <VisXYContainer
      :height="height"
      :data="bins"
    >
      <VisStackedBar
        :x="xAccessor"
        :y="yAccessor"
        :color="color"
        :rounded-corners="4"
      />
      <VisAxis
        type="x"
        :label="xLabel"
        :tick-format="xTickFormat"
        :num-ticks="bins.length"
        :tick-text-hide-overlapping="true"
      />
      <VisAxis
        type="y"
        :label="yLabel"
        :tick-format="yTickFormat"
      />
      <VisTooltip :triggers="tooltipTriggers" />
    </VisXYContainer>
  </div>
</template>

<script lang="ts" setup generic="T = unknown">
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip } from '@unovis/vue'
import { StackedBar } from '@unovis/ts'
import { computed } from 'vue'

export interface DistributionEntry<T = unknown> {
  /**
   * The numeric value placed on the distribution axis.
   */
  value: number
  /**
   * Human-readable name of the underlying item, shown on hover.
   */
  label: string
  /**
   * The underlying item, kept around so consumers can react to hovered bins.
   */
  item?: T
}

interface DistributionBin {
  from: number
  to: number
  entries: DistributionEntry<T>[]
}

interface Props {
  data: DistributionEntry<T>[]
  label?: string
  /**
   * Lower bound of the distribution axis.
   */
  min?: number
  /**
   * Upper bound of the distribution axis.
   */
  max?: number
  /**
   * Width of a single bin in axis units.
   */
  binSize?: number
  /**
   * Unit suffix appended to axis ticks and tooltips (e.g. '%').
   */
  unit?: string
  xLabel?: string
  yLabel?: string
  height?: number
  color?: string
  /**
   * Maximum number of item names listed in a bin tooltip before collapsing.
   */
  maxTooltipItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  binSize: 10,
  unit: '',
  height: 300,
  color: 'var(--primary)',
  maxTooltipItems: 8
})

const bins = computed<DistributionBin[]>(() => {
  const { min, max, binSize } = props

  if (binSize <= 0 || max <= min) {
    return []
  }

  const result: DistributionBin[] = []

  for (let from = min; from < max; from += binSize) {
    result.push({ from, to: Math.min(from + binSize, max), entries: [] })
  }

  for (const entry of props.data) {
    const clamped = Math.min(Math.max(entry.value, min), max)
    const index = Math.min(
      Math.floor((clamped - min) / binSize),
      result.length - 1
    )

    result[index]?.entries.push(entry)
  }

  return result
})

const formatRange = (bin: DistributionBin) =>
  `${bin.from}–${bin.to}${props.unit}`

const xAccessor = (_bin: DistributionBin, i: number) => i

const yAccessor = (bin: DistributionBin) => bin.entries.length

const xTickFormat = (i: number) => {
  const bin = bins.value[i]

  return bin ? formatRange(bin) : ''
}

const yTickFormat = (value: number) =>
  Number.isInteger(value) ? String(value) : ''

const tooltipTriggers = computed(() => ({
  [StackedBar.selectors.bar]: (bin: DistributionBin) => {
    const { entries } = bin
    const shown = entries.slice(0, props.maxTooltipItems)
    const rest = entries.length - shown.length

    const lines = [
      `<b>${formatRange(bin)}</b>`,
      `Количество: ${entries.length}`,
      ...shown.map((entry) => entry.label)
    ]

    if (rest > 0) {
      lines.push(`и ещё ${rest}…`)
    }

    return lines.join('<br>')
  }
}))
</script>

<style lang="sass" scoped>
.distribution
  --vis-axis-grid-color: var(--grid-color)
  --vis-axis-tick-color: var(--grid-color)
  --vis-axis-tick-label-color: var(--text-light)
  --vis-tooltip-background-color: var(--form-background)
  --vis-tooltip-text-color: var(--form-text-color)
  --vis-tooltip-border-color: transparent

  &__label
    margin: 0 0 0.5em
</style>
