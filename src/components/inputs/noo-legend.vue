<template>
  <div class="noo-legend">
    <div
      v-for="item in items"
      :key="item.color"
      class="noo-legend__item"
    >
      <noo-color-badge :color="item.color" />
      <noo-text-block
        dimmed
        size="small"
        no-margin
      >
        {{ item.label }}
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface LegendItem {
  color: string
  label: string
}

interface Props {
  items: LegendItem[]
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-legend
  display: flex
  gap: 0.1em
  flex-direction: column

  &__item
    display: flex
    align-items: center
    gap: 0.5em
</style>
