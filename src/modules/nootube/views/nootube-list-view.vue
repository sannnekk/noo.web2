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
          @click="openCreateForm"
        >
          Загрузить видео
        </noo-button>
      </template>
      <template #tile="{ item }">
        <noo-video-card
          :video="item"
          :actions="actionsFor(item)"
        />
      </template>
    </noo-card-search-view>

    <noo-base-modal
      v-model:is-open="isFormOpen"
      full-width
      :close-on-outside-click="false"
      :close-on-esc="false"
    >
      <template #title>
        <noo-title :size="2">
          {{ editedVideo ? 'Редактировать видео' : 'Загрузить видео' }}
        </noo-title>
      </template>
      <template #content>
        <nootube-video-form
          v-if="isFormOpen"
          :video="editedVideo"
          @done="onFormDone"
          @cancel="closeForm"
        />
      </template>
    </noo-base-modal>

    <noo-sure-modal
      v-model:is-open="isDeleteOpen"
      @confirm="onConfirmDelete"
    >
      <template #title>
        <noo-title :size="2"> Удалить видео? </noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Видео «{{ deletedVideo?.title }}» будет удалено безвозвратно.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Удалить </template>
    </noo-sure-modal>

    <nootube-video-statistics-modal
      v-model:is-open="isStatisticsOpen"
      :video="statisticsVideo"
    />
  </div>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import { isApiError, type ApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { ref } from 'vue'
import { NooTubeService } from '../api/nootube.service'
import type { NooTubeVideoEntity } from '../api/nootube.types'
import nootubeVideoForm from './nootube-video-form.vue'
import nootubeVideoStatisticsModal from '../components/nootube-video-statistics-modal.vue'
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
// The video being edited; `null` means the form is in create (upload) mode.
const editedVideo = ref<NooTubeVideoEntity | null>(null)

const isDeleteOpen = ref(false)
const deletedVideo = ref<NooTubeVideoEntity | null>(null)

const isStatisticsOpen = ref(false)
const statisticsVideo = ref<NooTubeVideoEntity | null>(null)

function actionsFor(video: NooTubeVideoEntity): DropdownAction[] {
  return [
    {
      label: 'Редактировать',
      icon: 'edit',
      if: () => can(NooTubePermissions.editVideo),
      onClick: () => openEditForm(video)
    },
    {
      label: 'Статистика',
      icon: 'statistics',
      if: () => can(NooTubePermissions.viewStatistics),
      onClick: () => openStatistics(video)
    },
    {
      label: 'Удалить',
      icon: 'delete',
      variant: 'danger',
      if: () => can(NooTubePermissions.deleteVideo),
      onClick: () => openDeleteModal(video)
    }
  ]
}

function openCreateForm() {
  editedVideo.value = null
  isFormOpen.value = true
}

function openEditForm(video: NooTubeVideoEntity) {
  editedVideo.value = video
  isFormOpen.value = true
}

function openStatistics(video: NooTubeVideoEntity) {
  statisticsVideo.value = video
  isStatisticsOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editedVideo.value = null
}

function onFormDone() {
  props.tryAgain?.()

  if (editedVideo.value) {
    globalUiStore.createSuccessToast('Видео обновлено')
    closeForm()

    return
  }

  // In create mode keep the modal open so the user sees the completed upload
  // state and closes it themselves; just refresh the list in the background.
  globalUiStore.createSuccessToast('Видео загружено и обрабатывается')
}

function openDeleteModal(video: NooTubeVideoEntity) {
  deletedVideo.value = video
  isDeleteOpen.value = true
}

async function onConfirmDelete() {
  const video = deletedVideo.value

  if (!video) {
    return
  }

  const response = await NooTubeService.delete(video.id)

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      'Не удалось удалить видео',
      response.error
    )

    return
  }

  globalUiStore.createSuccessToast('Видео удалено')
  props.tryAgain?.()
}
</script>

<style scoped lang="sass">
.nootube-list-view
  padding: 0 0
</style>
