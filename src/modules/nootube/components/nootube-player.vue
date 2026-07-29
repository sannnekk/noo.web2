<template>
  <div class="nootube-player">
    <kinescope-player
      ref="playerRef"
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
import { ref } from 'vue'

/**
 * The part of the Kinescope iframe player API this component uses. The package
 * ships no types, and it exposes the raw player instance as `player`.
 */
interface KinescopePlayerInstance {
  seekTo: (seconds: number) => Promise<void> | void
  play: () => Promise<void> | void
}

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

const playerRef = ref<{ player: KinescopePlayerInstance | null } | null>(null)

/**
 * Jumps to a position in the video and resumes playback. Does nothing while
 * the player is still loading.
 */
async function seekTo(seconds: number): Promise<void> {
  const player = playerRef.value?.player

  if (!player) {
    return
  }

  await player.seekTo(Math.max(0, seconds))
  await player.play()
}

defineExpose({ seekTo })
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
