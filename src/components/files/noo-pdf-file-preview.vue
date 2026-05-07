<template>
  <div class="noo-pdf-file-preview">
    <noo-loader-icon
      v-if="!src"
      class="noo-pdf-file-preview__loader"
    />
    <embed
      v-else
      :src="src"
      type="application/pdf"
      class="noo-pdf-file-preview__embed"
    />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  src: string | null
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.noo-pdf-file-preview
  width: 100%
  height: 75vh
  display: flex
  align-items: center
  justify-content: center
  background-color: var(--background)
  border-radius: var(--border-radius)
  overflow: hidden

  &__embed
    width: 100%
    height: 100%
    border: none

  &__loader
    font-size: 2em
</style>
