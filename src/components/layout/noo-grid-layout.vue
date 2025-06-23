<template>
  <div
    class="noo-grid-layout"
    :style="{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridGap: gap
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  cols?: number
  gap?: string
}

withDefaults(defineProps<Props>(), {
  cols: 6,
  gap: '1em'
})
</script>
