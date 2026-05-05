<template>
  <div
    class="noo-card-stack"
    :style="{ 'grid-template-columns': `repeat(${cols}, 1fr)` }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  cols?: number
}

withDefaults(defineProps<Props>(), {
  cols: 3
})
</script>

<style lang="sass">
.noo-card-stack
  display: grid
  gap: 0.5em
</style>
