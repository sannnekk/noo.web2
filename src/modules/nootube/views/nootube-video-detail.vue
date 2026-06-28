<template>
  <article class="nootube-video-detail">
    <div class="nootube-video-detail__player">
      <nootube-player
        v-if="isPlayable"
        :video-id="video.externalIdentifier!"
      />
      <div
        v-else
        class="nootube-video-detail__player__placeholder"
      >
        <noo-uploaded-image
          v-if="thumbnailSrc"
          class="nootube-video-detail__player__placeholder__thumbnail"
          :src="thumbnailSrc"
        />
        <div class="nootube-video-detail__player__placeholder__overlay">
          <noo-loader-icon v-if="isProcessing" />
          <noo-text-block>{{ stateMessage }}</noo-text-block>
        </div>
      </div>
    </div>

    <header class="nootube-video-detail__header">
      <noo-title :size="2">
        {{ video.title }}
      </noo-title>
      <div class="nootube-video-detail__header__meta">
        <span
          class="nootube-video-detail__header__meta__badge"
          :class="{
            'nootube-video-detail__header__meta__badge--favourite':
              video.isFavourite
          }"
          @click="$emit('toggle-favourite')"
        >
          {{ video.isFavourite ? 'В избранном' : 'Добавить в избранное' }}
        </span>
        <span>
          Опубликовано
          <noo-date
            :value="video.publishedAt"
            timezones="both"
            include-time
          />
        </span>
      </div>
    </header>

    <noo-user-card
      v-if="video.uploadedByUser"
      :user="video.uploadedByUser"
    />

    <noo-text-block
      v-if="video.description"
      class="nootube-video-detail__description"
    >
      {{ video.description }}
    </noo-text-block>

    <section class="nootube-video-detail__comments">
      <noo-title :size="3"> Комментарии </noo-title>
      <nootube-video-comments :video-id="video.id" />
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NooTubeVideoEntity } from '../api/nootube.types'
import nootubePlayer from '../components/nootube-player.vue'
import nootubeVideoComments from '../components/nootube-video-comments.vue'

interface Props {
  video: NooTubeVideoEntity
}

type Emits = (event: 'toggle-favourite') => void

const props = defineProps<Props>()

defineEmits<Emits>()

const isPlayable = computed(
  () =>
    !!props.video.externalIdentifier &&
    (props.video.state === 'uploaded' || props.video.state === 'published')
)

const isProcessing = computed(
  () => props.video.state === 'uploading' || props.video.state === 'encoding'
)

const stateMessage = computed(() => {
  switch (props.video.state) {
    case 'not-uploaded':
      return 'Видео ещё не загружено'
    case 'uploading':
      return 'Видео загружается...'
    case 'encoding':
      return 'Видео обрабатывается, скоро будет доступно'
    default:
      return 'Видео недоступно для просмотра'
  }
})

const thumbnailSrc = computed(
  () => props.video.thumbnail ?? props.video.externalThumbnailUrl ?? undefined
)
</script>

<style scoped lang="sass">
.nootube-video-detail
  display: flex
  flex-direction: column
  gap: 1.25em
  max-width: 1000px
  margin: 0 auto

  &__player
    width: 100%

    &__placeholder
      position: relative
      width: 100%
      aspect-ratio: 16 / 9
      border-radius: var(--border-radius)
      overflow: hidden
      background-color: var(--light-background-color)

      &__thumbnail
        position: absolute
        inset: 0
        width: 100%
        height: 100%
        object-fit: cover
        object-position: center

      &__overlay
        position: absolute
        inset: 0
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        gap: 0.75em
        text-align: center
        padding: 1em
        color: white
        background-color: rgba(0, 0, 0, 0.55)

  &__header
    display: flex
    flex-direction: column
    gap: 0.35em

    .noo-title
      margin: 0

    &__meta
      display: flex
      align-items: center
      gap: 0.5em
      color: var(--text-light)
      font-size: 0.9em

      &__badge
        padding: 0.2em 0.8em
        border-radius: 5em
        background-color: var(--light-background-color)
        color: var(--form-text-color)
        cursor: pointer

        &:hover
          background-color: var(--primary)
          color: #000

        &--favourite
          background-color: var(--primary)
          color: #000

          &:hover
            background-color: var(--form-background)
            color: var(--form-text-color)

  &__description
    margin: 0
    white-space: pre-line
    word-break: break-word
</style>
