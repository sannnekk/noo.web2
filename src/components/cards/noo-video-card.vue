<template>
  <router-link
    class="noo-video-card"
    :to="{ name: 'nootube.detail', params: { videoId: video.id } }"
  >
    <div class="noo-video-card__inner">
      <div class="noo-video-card__inner__thumbnail">
        <noo-uploaded-image :src="video.thumbnail" />
        <div
          v-if="actions?.length"
          class="noo-video-card__inner__thumbnail__actions"
          @click.stop.prevent
        >
          <noo-dropdown :actions="actions" />
        </div>
        <div class="noo-video-card__inner__thumbnail__duration">
          {{ duration }}
        </div>
        <div
          v-if="!video.isListed"
          class="noo-video-card__inner__thumbnail__unlisted-tag"
        >
          Не в списке
        </div>
      </div>
      <div class="noo-video-card__inner__info">
        <noo-title
          :size="3"
          no-margin
        >
          {{ video.title }}
        </noo-title>
        <noo-text-block
          v-if="video.description"
          size="small"
          dimmed
          no-margin
        >
          {{ video.description }}
        </noo-text-block>
        <noo-user-card
          v-if="video.uploadedByUser"
          :user="video.uploadedByUser"
        />
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import { formatVideoDuration } from '@/modules/nootube/video.utils'
import { computed } from 'vue'

interface Props {
  video: NooTubeVideoEntity
  actions?: DropdownAction[]
}

const props = defineProps<Props>()

const duration = computed(() => formatVideoDuration(props.video.duration))
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
    &__info
      padding-top: 0.3em

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

      &__actions
        position: absolute
        top: 0.4em
        right: 0.4em
        border-radius: var(--border-radius)
        background-color: rgba(0, 0, 0, 0.5)
        color: white

      &__duration
        position: absolute
        bottom: 0
        right: 0
        background-color: rgba(0, 0, 0, 0.5)
        color: white
        padding: 0.2em 0.4em
        font-size: 0.8em
        border-top-left-radius: var(--border-radius)

      &__unlisted-tag
        position: absolute
        top: 0.4em
        left: 0.4em
        background-color: var(--warning)
        color: #000
        border-radius: var(--border-radius)
        font-size: 0.75em
        padding: 0.2em 0.4em
        font-weight: 600
</style>
