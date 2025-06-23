<template>
  <div class="noo-file-list">
    <div
      v-for="file in files"
      :key="file.id"
      class="noo-file-list__file"
    >
      <noo-file-card :file="file" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaEntity } from '@/modules/media/api/media.types';

interface Props {
  files: MediaEntity[]
}

defineProps<Props>();
</script>

<style scoped lang="sass">
.noo-file-list
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))
  gap: 1em

  &__file
</style>
