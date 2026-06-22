<template>
  <div class="nootube-video-form">
    <ol class="nootube-video-form__steps">
      <li
        v-for="stepItem in steps"
        :key="stepItem.number"
        class="nootube-video-form__steps__item"
        :class="{
          'nootube-video-form__steps__item--active': step === stepItem.number,
          'nootube-video-form__steps__item--done': step > stepItem.number
        }"
      >
        <span class="nootube-video-form__steps__item__number">
          {{ stepItem.number }}
        </span>
        <span class="nootube-video-form__steps__item__label">
          {{ stepItem.label }}
        </span>
      </li>
    </ol>

    <div
      v-show="step === 1"
      class="nootube-video-form__fields"
    >
      <noo-text-input
        v-model="draft.title"
        label="Название"
        placeholder="Например: Разбор пробного варианта"
        :validators="[validateTitle]"
      />
      <noo-textarea
        v-model="draft.description"
        label="Описание"
        placeholder="Краткое описание видео (необязательно)"
      />
      <noo-file-uploader
        v-model="thumbnailMedia"
        label="Обложка"
        :types="['image']"
        :max-count="1"
        crop
        :crop-ratio="16 / 9"
        category="video-cover"
      />
      <noo-checkbox v-model="draft.isListed">
        Показывать видео в общем списке
      </noo-checkbox>
    </div>

    <div
      v-show="step === 2"
      class="nootube-video-form__upload"
    >
      <nootube-video-uploader
        v-model:busy="isUploading"
        :video="draft"
        @uploaded="onUploaded"
      />
    </div>

    <div class="nootube-video-form__actions">
      <template v-if="step === 1">
        <noo-button
          variant="primary"
          :disabled="!canProceed"
          @click="step = 2"
        >
          Далее
        </noo-button>
        <noo-button
          variant="secondary"
          @click="$emit('cancel')"
        >
          Отмена
        </noo-button>
      </template>
      <template v-else>
        <noo-button
          v-if="isUploaded"
          variant="primary"
          @click="$emit('cancel')"
        >
          Готово
        </noo-button>
        <noo-button
          v-else
          variant="secondary"
          :disabled="isUploading"
          @click="step = 1"
        >
          Назад
        </noo-button>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isStringOfLength } from '@/core/validators/string.utils'
import type { MediaEntity } from '@/modules/media/api/media.types'
import { computed, reactive, ref, watch } from 'vue'
import { NooTubeService } from '../api/nootube.service'
import nootubeVideoUploader from '../components/nootube-video-uploader.vue'

interface Emits {
  /**
   * Emitted once the video has been created and its upload finished.
   */
  (e: 'done', videoId: string): void
  /**
   * Emitted when the user cancels the form before uploading.
   */
  (e: 'cancel'): void
}

const emits = defineEmits<Emits>()

const steps = [
  { number: 1, label: 'Информация' },
  { number: 2, label: 'Загрузка' }
] as const

const step = ref<1 | 2>(1)
const isUploading = ref(false)
const isUploaded = ref(false)

const draft = reactive(NooTubeService.createDraft())

// The file uploader works with MediaEntity objects, while the video keeps only
// the thumbnail id. Keep the selected cover in sync with the draft.
const thumbnailMedia = ref<MediaEntity[]>([])

watch(thumbnailMedia, (media) => {
  draft.thumbnailId = media[0]?.id ?? null
})

const canProceed = computed(() => validateTitle(draft.title) === true)

function validateTitle(value: string) {
  return isStringOfLength(value, 1, 255)
}

function onUploaded(videoId: string) {
  isUploaded.value = true
  emits('done', videoId)
}
</script>

<style lang="sass" scoped>
.nootube-video-form
  display: flex
  flex-direction: column
  gap: 1.25em

  &__steps
    display: flex
    gap: 1.5em
    margin: 0
    padding: 0
    list-style: none

    &__item
      display: flex
      align-items: center
      gap: 0.5em
      color: var(--text-light)

      &__number
        display: flex
        align-items: center
        justify-content: center
        width: 1.6em
        height: 1.6em
        border-radius: 50%
        border: 1px solid var(--border-color)
        font-size: 0.85em

      &--active
        color: var(--text)

        .nootube-video-form__steps__item__number
          border-color: var(--primary)
          background-color: var(--primary)
          color: var(--lightest)

      &--done
        .nootube-video-form__steps__item__number
          border-color: var(--primary)
          color: var(--primary)

  &__fields
    display: flex
    flex-direction: column
    gap: 1em

  &__actions
    display: flex
    justify-content: flex-end
    gap: 0.5em
</style>
