<template>
  <div class="nootube-player">
    <kinescope-player
      class="nootube-player__frame"
      :video-id="videoId"
      width="100%"
      height="100%"
      :auto-play="autoplay"
      @ready="$emit('ready')"
      @ended="$emit('ended')"
    />
  </div>
</template>

<script setup lang="ts">
import { KinescopePlayer } from '@kinescope/vue-kinescope-player'

interface Props {
  /**
   * Kinescope video identifier — the video's `externalIdentifier`.
   */
  videoId: string
  autoplay?: boolean
}

interface Emits {
  (e: 'ready'): void
  (e: 'ended'): void
}

withDefaults(defineProps<Props>(), {
  autoplay: false
})

defineEmits<Emits>()
</script>

<style scoped lang="sass">
.nootube-player
  width: 100%
  aspect-ratio: 16 / 9
  border-radius: var(--border-radius)
  overflow: hidden
  background-color: black

  &__frame
    display: block
    width: 100%
    height: 100%

    :deep(iframe)
      border: none
      width: 100%
      height: 100%
</style>
