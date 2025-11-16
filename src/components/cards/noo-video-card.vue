<template>
  <vue-router
    class="noo-video-card"
    :to="{
      name: 'nootube.video',
      params: { videoId: video.id }
    }"
  >
    <div class="noo-video-card__inner">
      <div class="noo-video-card__inner__thumbnail">
        <noo-uploaded-image :src="video.thumbnail" />
        <div class="noo-video-card__inner__thumbnail__duration">
          {{ duration }}
        </div>
      </div>
      <div class="noo-video-card__inner__info">
        <noo-title :size="3">
          {{ video.title }}
        </noo-title>
        <noo-text-block
          v-if="video.description"
          size="small"
          dimmed
        >
          {{ video.description }}
        </noo-text-block>
        <noo-user-card
          v-if="video.uploadedBy"
          :user="video.uploadedBy"
        />
      </div>
    </div>
  </vue-router>
</template>

<script setup lang="ts">
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import { computed } from 'vue'

interface Props {
  video: NooTubeVideoEntity
}

const props = defineProps<Props>()

const duration = computed(() => stringifyDuration(props.video.duration))

function stringifyDuration(length: number | null): string {
  if (length === null || length < 0) {
    return '--:--'
  }

  const hours = Math.floor(length / 3600)
  const minutes = Math.floor((length % 3600) / 60)
  const seconds = length % 60

  return `${hours ? hours + ':' : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped lang="sass">
.noo-video-card
  display: block
  text-decoration: none
  color: inherit
  cursor: pointer

  &:hover
    color: var(--lila)

  &__inner
    &__thumbnail
      overflow: hidden
      border-radius: var(--border-radius)
      width: 100%
      aspect-ratio: 16 / 9
      position: relative

      img
        width: 100%
        height: 100%
        object-fit: cover
        object-position: center

      &__duration
        position: absolute
        bottom: 0
        right: 0
        background-color: rgba(0, 0, 0, 0.5)
        color: white
        padding: 0.2em 0.4em
        font-size: 0.8em
        border-top-left-radius: var(--border-radius)
</style>
