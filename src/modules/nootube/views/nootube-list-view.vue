<template>
  <div class="nootube-list-view">
    <noo-card-search-view
      v-model:page="page"
      v-model:search="search"
      :items="items"
      :total-count="totalCount"
      :limit="limit"
      :is-loading="isLoading"
      :per-row="4"
      gap="0.5em"
      :error="error"
      :try-again="tryAgain"
    >
      <template #actions>
        <noo-button
          v-if="can(NooTubePermissions.createVideo)"
          @click="isFormOpen = true"
        >
          Загрузить видео
        </noo-button>
      </template>
      <template #tile="{ item }">
        <noo-video-card :video="item" />
      </template>
    </noo-card-search-view>

    <noo-base-modal
      v-model:is-open="isFormOpen"
      full-width
      :close-on-outside-click="false"
      :close-on-esc="false"
    >
      <template #title>
        <noo-title :size="2"> Загрузить видео </noo-title>
      </template>
      <template #content>
        <nootube-video-form
          v-if="isFormOpen"
          @done="onVideoUploaded"
          @cancel="isFormOpen = false"
        />
      </template>
    </noo-base-modal>
  </div>
</template>

<script setup lang="ts">
import type { ApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { ref } from 'vue'
import type { NooTubeVideoEntity } from '../api/nootube.types'
import nootubeVideoForm from './nootube-video-form.vue'
import { useNooTubePermissions, NooTubePermissions } from '../permissions'

interface Props {
  items: NooTubeVideoEntity[]
  totalCount: number
  isLoading?: boolean
  limit?: number
  error?: ApiError | null
  tryAgain?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 25,
  isLoading: false
})

const page = defineModel<number>('page', {
  default: 1
})

const search = defineModel<string>('search', {
  default: ''
})

const { can } = useNooTubePermissions()

const globalUiStore = useGlobalUIStore()

const isFormOpen = ref(false)

function onVideoUploaded() {
  // Keep the modal open so the user sees the completed state and closes it
  // themselves; just refresh the list and notify in the background.
  globalUiStore.createSuccessToast('Видео загружено и обрабатывается')
  props.tryAgain?.()
}
</script>

<style scoped lang="sass">
.nootube-list-view
  padding: 0 0
</style>
