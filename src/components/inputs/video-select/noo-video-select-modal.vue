<template>
  <noo-base-modal
    v-model:is-open="isOpen"
    full-width
  >
    <template #title>
      <noo-title :size="2"> Выбрать видео </noo-title>
    </template>
    <template #content>
      <noo-card-search-view
        v-model:search="videoSearch.search.value"
        v-model:page="videoSearch.page.value"
        :items="videoSearch.data.value"
        :total-count="videoSearch.total.value"
        :limit="videoSearch.pageSize.value"
        :is-loading="videoSearch.isLoading.value"
        :error="videoSearch.error.value"
        :try-again="videoSearch.reload"
        :per-row="4"
      >
        <template #tile="{ item }">
          <noo-video-card
            :video="item"
            selectable
            :selected="isSelected(item)"
            @select="toggleVideo(item)"
          />
        </template>
      </noo-card-search-view>
    </template>
    <template #actions="{ close }">
      <noo-button @click="close()"> Готово </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { NooTubeService } from '@/modules/nootube/api/nootube.service'
import type { NooTubeVideoEntity } from '@/modules/nootube/api/nootube.types'
import { watch } from 'vue'

const model = defineModel<NooTubeVideoEntity[]>({
  default: () => []
})

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const videoSearch = useSearch(NooTubeService.get, { immediate: false })

// load the videos only when the modal is first opened
watch(isOpen, (open) => {
  if (open) {
    videoSearch.reloadIfEmpty()
  }
})

function isSelected(video: NooTubeVideoEntity): boolean {
  return model.value.some((v) => v.id === video.id)
}

function toggleVideo(video: NooTubeVideoEntity) {
  if (isSelected(video)) {
    model.value = model.value.filter((v) => v.id !== video.id)

    return
  }

  model.value = [...model.value, video]
}
</script>
