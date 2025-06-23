<template>
  <div class="noo-pdf-preview">
    <embed
      v-if="src"
      :src="src"
      type="application/pdf"
      width="100%"
      height="100%"
    >
    <div class="noo-pdf-preview__not-found">
      <noo-text-block>
        PDF файл не найден
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string | null | undefined
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.noo-pdf-preview
  &__not-found
    display: flex
    align-items: center
    justify-content: center
    height: 100%
    width: 100%
</style>
