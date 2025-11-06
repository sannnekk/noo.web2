<template>
  <div class="noo-progress-bar">
    <div class="noo-progress-bar__bar">
      <div
        class="noo-progress-bar__bar__progress"
        :style="{ width: `${value}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-progress-bar
  width: 100%
  height: 6px
  background-color: var(--light)
  border-radius: var(--border-radius)
  overflow: hidden

  &__bar
    width: 100%
    height: 100%
    background-color: transparent
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    overflow: hidden

    &__progress
      width: 0
      height: 100%
      background-color: var(--secondary)
      border-radius: var(--border-radius)
      overflow: hidden
      transition: width 0.3s ease
</style>
