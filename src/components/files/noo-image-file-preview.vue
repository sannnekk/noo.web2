<template>
  <div class="noo-image-file-preview">
    <noo-loader-icon
      v-if="!src"
      class="noo-image-file-preview__loader"
    />
    <img
      v-else
      :src="src"
      :alt="alt"
      class="noo-image-file-preview__image"
    />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  src: string | null
  alt?: string
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.noo-image-file-preview
  width: 100%
  display: flex
  align-items: center
  justify-content: center
  background-color: var(--background)
  border-radius: var(--border-radius)
  min-height: 200px
  max-height: 75vh
  overflow: hidden

  &__image
    max-width: 100%
    max-height: 75vh
    object-fit: contain

  &__loader
    font-size: 2em
</style>
