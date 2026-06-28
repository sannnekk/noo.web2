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
      @toggle-favourite="toggleFavourite.execute"
    />
  </div>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { computed, watch } from 'vue'
import { NooTubeService } from '../api/nootube.service'
import nootubeVideoDetail from '../views/nootube-video-detail.vue'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'

export interface NooTubeVideoDetailPageProps {
  videoId: string
}

const props = defineProps<NooTubeVideoDetailPageProps>()

const uiStore = useGlobalUIStore()
const request = useApiRequest(NooTubeService.getById)
const video = computed(() => request.data.value)

const toggleFavourite = useApiRequest(
  () => NooTubeService.toggleFavourite(props.videoId),
  () => {
    if (!video.value) {
      return
    }

    const isFavourite = !video.value.isFavourite

    request.data.value = { ...video.value, isFavourite }

    uiStore.createSuccessToast(
      isFavourite
        ? 'Видео добавлено в избранное'
        : 'Видео удалено из избранного'
    )
  },
  (error) =>
    uiStore.createApiErrorToast('Не удалось добавить видео в избранное', error)
)

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
