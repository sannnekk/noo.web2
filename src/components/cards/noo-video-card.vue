<template>
  <component
    :is="selectable ? 'div' : RouterLink"
    class="noo-video-card"
    :class="{ 'noo-video-card--selectable': selectable }"
    :to="
      selectable
        ? undefined
        : { name: 'nootube.detail', params: { videoId: video.id } }
    "
    @click="selectable && emits('select')"
  >
    <div class="noo-video-card__inner">
      <div
        class="noo-video-card__inner__thumbnail"
        :class="{ 'noo-video-card__inner__thumbnail--selected': selected }"
      >
        <noo-uploaded-image :src="video.thumbnail" />
        <div
          v-if="actions?.length"
          class="noo-video-card__inner__thumbnail__actions"
          @click.stop.prevent
        >
          <noo-dropdown :actions="actions" />
        </div>
        <div
          v-if="removable"
          class="noo-video-card__inner__thumbnail__remove"
          @click.stop.prevent="emits('remove')"
        >
          <noo-icon
            name="close"
            hoverable
          />
        </div>
        <div
          v-if="selected"
          class="noo-video-card__inner__thumbnail__selected-overlay"
        >
          <div class="noo-video-card__inner__thumbnail__selected-overlay__icon">
            <noo-icon name="check-green" />
          </div>
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
  </component>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import { formatVideoDuration } from '@/modules/nootube/video.utils'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

interface Props {
  video: NooTubeVideoEntity
  actions?: DropdownAction[]
  /**
   * Renders the card as a plain block instead of a link to the video page.
   * Clicking the card emits `select`.
   */
  selectable?: boolean
  selected?: boolean
  /**
   * Shows a remove button on the thumbnail. Clicking it emits `remove`.
   */
  removable?: boolean
}

const props = defineProps<Props>()

const emits = defineEmits<{
  select: []
  remove: []
}>()

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

      &--selected
        outline: 2px solid var(--lila)

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

      &__remove
        position: absolute
        top: 0.4em
        right: 0.4em
        font-size: 1.2em
        display: flex
        align-items: center
        justify-content: center
        padding: 0.2em
        border-radius: 30px
        background-color: rgba(0, 0, 0, 0.5)
        color: white
        z-index: 1

        &:hover
          background-color: rgba(0, 0, 0, 0.9)

      &__selected-overlay
        position: absolute
        inset: 0
        display: flex
        align-items: center
        justify-content: center
        font-size: 2em
        background-color: rgba(0, 0, 0, 0.35)

        &__icon
          display: flex
          align-items: center
          justify-content: center
          width: 1.2em
          height: 1.2em
          border-radius: 50%
          background-color: white

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
