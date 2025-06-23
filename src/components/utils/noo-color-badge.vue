<template>
  <div
    class="noo-color-badge"
    :style="{ backgroundColor: color }"
  />
</template>

<script setup lang="ts">
interface Props {
  color?: string
}

withDefaults(defineProps<Props>(), {
  color: 'var(--text-light)'
})
</script>

<style scoped lang="sass">
.noo-color-badge
  display: inline-block
  width: 0.4em
  height: 0.8em
  border-radius: var(--border-radius)
  position: relative
  top: 0.05em
</style>
