<template>
  <div class="noo-video-select noo-input">
    <label
      v-if="label"
      class="noo-input__label"
    >
      {{ label }}
    </label>
    <div
      v-if="model.length"
      class="noo-video-select__items"
    >
      <noo-video-card
        v-for="video in model"
        :key="video.id"
        :video="video"
        selectable
        removable
        @remove="removeVideo(video)"
      />
    </div>
    <noo-text-block
      v-else
      size="small"
      dimmed
    >
      Видео пока не выбраны
    </noo-text-block>
    <div class="noo-video-select__actions">
      <noo-button
        variant="secondary"
        @click="isModalOpen = true"
      >
        Добавить видео
      </noo-button>
    </div>
    <noo-video-select-modal
      v-model="model"
      v-model:is-open="isModalOpen"
    />
  </div>
</template>

<script setup lang="ts">
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import { ref } from 'vue'

interface Props {
  label?: string
}

defineProps<Props>()

const model = defineModel<NooTubeVideoEntity[]>({
  default: () => []
})

const isModalOpen = ref(false)

function removeVideo(video: NooTubeVideoEntity) {
  model.value = model.value.filter((v) => v.id !== video.id)
}
</script>

<style scoped lang="sass">
.noo-video-select
  &__items
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
    gap: 0.7em
    font-size: 0.85em

  &__actions
    margin-top: 0.7em
</style>

<style scoped lang="sass" src="../noo-input.sass"></style>
