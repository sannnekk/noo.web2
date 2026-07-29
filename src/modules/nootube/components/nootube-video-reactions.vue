<template>
  <div class="nootube-video-reactions">
    <noo-user-reactions
      :reactions="counts"
      :labels="labels"
      :my-reaction="reactions?.myReaction ?? undefined"
      :loading="request.isLoading.value"
      :readonly="isReadonly"
      @react="react"
    />
  </div>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { computed, watch } from 'vue'
import { NooTubeService } from '../api/nootube.service'
import type { VideoReaction } from '../api/nootube.types'
import { videoReactions } from '../constants'
import { NooTubePermissions, useNooTubePermissions } from '../permissions'
import { toggleVideoReaction } from '../video.utils'

interface Props {
  videoId: string
}

const props = defineProps<Props>()

const uiStore = useGlobalUIStore()
const { can } = useNooTubePermissions()

const request = useApiRequest(NooTubeService.getReactions)
const reactions = computed(() => request.data.value)

const isReadonly = computed(() => !can(NooTubePermissions.reactToVideo))

/**
 * The API omits the reactions nobody picked, but all of them are always shown,
 * in a stable order.
 */
const counts = computed(() =>
  Object.fromEntries(
    videoReactions.map(({ value }) => [
      value,
      reactions.value?.counts[value] ?? 0
    ])
  )
)

const labels = Object.fromEntries(
  videoReactions.map(({ value, label }) => [value, label])
)

async function react(reaction: string): Promise<void> {
  const previous = reactions.value

  if (!previous || isReadonly.value) {
    return
  }

  request.data.value = toggleVideoReaction(previous, reaction as VideoReaction)

  const response = await NooTubeService.toggleReaction(
    props.videoId,
    reaction as VideoReaction
  )

  if (isApiError(response)) {
    request.data.value = previous
    uiStore.createApiErrorToast('Не удалось сохранить реакцию', response.error)
  }
}

watch(() => props.videoId, request.execute, { immediate: true })
</script>

<style scoped lang="sass">
.nootube-video-reactions
  display: flex
</style>
