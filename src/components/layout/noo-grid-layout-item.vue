<template>
  <div
    class="noo-grid-layout-item"
    :style="{
      gridColumn: `span ${colspan} / span ${col}`,
      gridRow: `span ${rowspan} / span ${row}`,
      display: 'grid',
      alignItems: verticalAlign === 'stretch' ? 'stretch' : verticalAlign,
      justifyItems: horizontalAlign === 'stretch' ? 'stretch' : horizontalAlign,
      padding: '0.25em'
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  col: number
  row: number
  colspan?: number
  rowspan?: number
  horizontalAlign?: 'left' | 'center' | 'right' | 'stretch'
  verticalAlign?: 'top' | 'center' | 'bottom' | 'stretch'
}

withDefaults(defineProps<Props>(), {
  colspan: 1,
  rowspan: 1,
  horizontalAlign: 'left',
  verticalAlign: 'center'
})
</script>
