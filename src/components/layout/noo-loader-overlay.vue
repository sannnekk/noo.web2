<template>
  <Teleport to="body">
    <div class="loader-overlay">
      <noo-loader-icon class="loader-overlay__icon" />
      <noo-progress-bar
        v-if="loadingProgress > 0"
        class="loader-overlay__progress"
        :value="loadingProgress"
      />
      <noo-title :size="2">
        Загрузка...
      </noo-title>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  loadingProgress: number
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.loader-overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: #00000088
  z-index: 99999
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center

  &__icon
    display: block
    width: 1em
    height: 1em
    font-size: 100px

  &__progress
    width: 90%
    margin-top: 2em
    max-width: 200px

  h2
    color: #fff
    font-size: 1.8em
    margin-top: 0
</style>
