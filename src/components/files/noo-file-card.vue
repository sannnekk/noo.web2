<template>
  <a
    class="noo-file-card"
    :href="props.file.url ?? 'https://example.com'"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="noo-file-card__icon">
      <noo-icon :name="icon" />
    </div>
    <noo-text-block
      class="noo-file-card__label"
      size="small"
      dimmed
    >
      {{ props.file.actualName }}
    </noo-text-block>
  </a>
</template>

<script setup lang="ts">
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils';
import type { MediaEntity } from '@/modules/media/api/media.types';
import { computed } from 'vue';
import type { IconName } from '../icons/noo-icon.vue';

interface Props {
  file: PossiblyUnsavedEntity<MediaEntity>
}

const props = defineProps<Props>();

const icon = computed<IconName>(() => {
  switch (props.file.extension) {
    case 'pdf':
      return 'pdf-file'
    case 'jpg':
    case 'jpeg':
      return 'jpg-file'
    case 'png':
      return 'png-file'
    default:
      return 'info'
  }
})
</script>

<style scoped lang="sass">
.noo-file-card
  text-decoration: none
  color: inherit
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5em
  padding: 0.5em
  border-radius: var(--border-radius)
  background-color: var(--light-background-color)
  cursor: pointer
  transition: box-shadow 0.1s ease-in-out

  &:hover
    box-shadow: var(--block-shadow)

  &__icon
    font-size: 3em
    line-height: 1em
    padding: 0.2em

  &__label
    text-align: center
    margin: 0
</style>
