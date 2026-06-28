<template>
  <div class="nootube-video-detail-page">
    <noo-back-button :route="{ name: 'nootube.list' }">
      Назад к списку видео
    </noo-back-button>
    <div
      v-if="request.isLoading.value"
      class="nootube-video-detail-page__state"
    >
      <noo-loader-icon contrast />
    </div>

    <noo-error-block
      v-else-if="request.error.value"
      with-image
      centered
      :try-again="() => request.execute(videoId)"
    >
      <noo-title :size="3"> Не удалось загрузить видео </noo-title>
    </noo-error-block>

    <nootube-video-detail
      v-else-if="request.data.value"
      :video="request.data.value"
    />
  </div>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { watch } from 'vue'
import { NooTubeService } from '../api/nootube.service'
import nootubeVideoDetail from '../views/nootube-video-detail.vue'

export interface NooTubeVideoDetailPageProps {
  videoId: string
}

const props = defineProps<NooTubeVideoDetailPageProps>()

const request = useApiRequest(NooTubeService.getById)

watch(
  () => props.videoId,
  (videoId) => request.execute(videoId),
  { immediate: true }
)
</script>

<style scoped lang="sass">
.nootube-video-detail-page
  padding: 1em

  &__back
    margin-bottom: 1em

  &__state
    display: flex
    justify-content: center
    padding: 3em 0
    font-size: 4em
</style>
