<template>
  <div class="nootube-video-uploader">
    <div
      v-if="status === 'idle'"
      class="nootube-video-uploader__dropzone"
      :class="{ 'nootube-video-uploader__dropzone--active': isDragging }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div class="nootube-video-uploader__dropzone__hint">
        <span>
          {{
            isDragging
              ? 'Отпустите, чтобы загрузить'
              : 'Перетащите видео или нажмите для выбора'
          }}
        </span>
        <span class="nootube-video-uploader__dropzone__hint__sub">
          Видеофайл · до {{ maxSizeLabel }}
        </span>
      </div>
    </div>

    <div
      v-else
      class="nootube-video-uploader__progress"
    >
      <div class="nootube-video-uploader__progress__head">
        <span class="nootube-video-uploader__progress__name">
          {{ selectedFile?.name }}
        </span>
        <span
          v-if="selectedFile"
          class="nootube-video-uploader__progress__size"
        >
          {{ formatBytes(selectedFile.size) }}
        </span>
      </div>

      <div class="nootube-video-uploader__progress__bar">
        <div
          class="nootube-video-uploader__progress__bar__fill"
          :class="{
            'nootube-video-uploader__progress__bar__fill--error':
              status === 'error',
            'nootube-video-uploader__progress__bar__fill--done':
              status === 'done'
          }"
          :style="{ width: `${barWidth}%` }"
        />
      </div>

      <div class="nootube-video-uploader__progress__status">
        <span
          :class="{
            'nootube-video-uploader__progress__status--error':
              status === 'error'
          }"
        >
          {{ statusText }}
        </span>
        <noo-button
          v-if="status === 'error'"
          variant="inline"
          size="small"
          @click="reset"
        >
          Выбрать другой файл
        </noo-button>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="video/*"
      class="nootube-video-uploader__input"
      @change="onInputChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { isApiError } from '@/core/api/api.utils'
import { appConfig } from '@/core/config/app.config'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import * as tus from 'tus-js-client'
import { NooTubeService } from '../api/nootube.service'
import type { PossiblyUnsavedNooTubeVideo } from '../api/nootube.types'

type UploadStatus =
  'idle' | 'creating' | 'uploading' | 'finishing' | 'done' | 'error'

interface Props {
  video: PossiblyUnsavedNooTubeVideo
}

type Emits = (e: 'uploaded', videoId: string) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

/**
 * Reflects whether an upload is in flight so the parent can prevent the modal
 * from being closed mid-upload.
 */
const busyModel = defineModel<boolean>('busy', { default: false })

const globalUiStore = useGlobalUIStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const status = ref<UploadStatus>('idle')
const progress = ref(0)
const selectedFile = ref<File | null>(null)

let upload: tus.Upload | null = null

const maxSizeLabel = computed(() => formatBytes(appConfig.maxVideoSizeInBytes))

const barWidth = computed(() => {
  if (status.value === 'creating') {
    return 3
  }

  return Math.max(progress.value, status.value === 'finishing' ? 100 : 0)
})

const statusText = computed(() => {
  switch (status.value) {
    case 'creating':
      return 'Подготовка загрузки…'
    case 'uploading':
      return `Загрузка… ${progress.value}%`
    case 'finishing':
      return 'Обработка видео…'
    case 'done':
      return 'Видео загружено'
    case 'error':
      return 'Не удалось загрузить видео'
    default:
      return ''
  }
})

watch(status, (value) => {
  busyModel.value = ['creating', 'uploading', 'finishing'].includes(value)
})

function openPicker() {
  fileInputRef.value?.click()
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  input.value = ''

  if (file) {
    void handleFile(file)
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0] ?? null

  if (file) {
    void handleFile(file)
  }
}

async function handleFile(file: File) {
  if (!file.type.startsWith('video/')) {
    globalUiStore.createWarningToast(
      'Неподдерживаемый тип файла',
      'Выберите видеофайл'
    )

    return
  }

  if (file.size > appConfig.maxVideoSizeInBytes) {
    globalUiStore.createWarningToast(
      'Файл слишком большой',
      `Максимальный размер — ${maxSizeLabel.value}`
    )

    return
  }

  selectedFile.value = file
  progress.value = 0
  status.value = 'creating'

  const response = await NooTubeService.create({
    ...props.video,
    fileSize: file.size,
    fileName: file.name
  })

  if (isApiError(response) || !response.data) {
    status.value = 'error'
    globalUiStore.createApiErrorToast(
      'Не удалось создать видео',
      isApiError(response) ? response.error : undefined
    )

    return
  }

  startUpload(file, response.data.uploadUrl, response.data.videoId)
}

function startUpload(file: File, uploadUrl: string, videoId: string) {
  status.value = 'uploading'

  upload = new tus.Upload(file, {
    uploadUrl,
    retryDelays: [0, 1000, 3000, 5000],
    metadata: {
      filename: file.name,
      filetype: file.type
    },
    onProgress: (bytesSent, bytesTotal) => {
      progress.value = bytesTotal
        ? Math.round((bytesSent / bytesTotal) * 100)
        : 0
    },
    onError: (error) => {
      status.value = 'error'
      globalUiStore.createErrorToast('Ошибка загрузки видео', error.message)
    },
    onSuccess: () => {
      void finishUpload(videoId)
    }
  })

  upload.start()
}

async function finishUpload(videoId: string) {
  status.value = 'finishing'

  const response = await NooTubeService.finishUpload(videoId)

  if (isApiError(response)) {
    status.value = 'error'
    globalUiStore.createApiErrorToast(
      'Не удалось завершить загрузку',
      response.error
    )

    return
  }

  status.value = 'done'
  emits('uploaded', videoId)
}

function reset() {
  void upload?.abort()
  upload = null
  selectedFile.value = null
  progress.value = 0
  status.value = 'idle'
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 Б'
  }

  const units = ['Б', 'КБ', 'МБ', 'ГБ']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / Math.pow(1024, exponent)

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

onBeforeUnmount(() => {
  void upload?.abort()
})
</script>

<style lang="sass" scoped>
.nootube-video-uploader
  &__dropzone
    display: flex
    align-items: center
    justify-content: center
    padding: 2.5em 1.25em
    border: 1px dashed var(--border-color)
    border-radius: var(--border-radius)
    background-color: var(--form-background)
    cursor: pointer
    text-align: center
    transition: border-color 0.15s ease, background-color 0.15s ease
    color: var(--text-light)

    &:hover,
    &:focus-visible
      border-color: var(--lila)
      outline: none

    &--active
      border-color: var(--primary)
      background-color: var(--background)

    &__hint
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.35em

      &__sub
        font-size: 0.8em
        color: var(--text-light)

  &__progress
    display: flex
    flex-direction: column
    gap: 0.6em
    padding: 1em
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    background-color: var(--form-background)

    &__head
      display: flex
      justify-content: space-between
      align-items: baseline
      gap: 1em

    &__name
      font-weight: 500
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap

    &__size
      font-size: 0.8em
      color: var(--text-light)
      flex-shrink: 0

    &__bar
      width: 100%
      height: 0.2em
      border-radius: 1em
      background-color: var(--background)
      overflow: hidden

      &__fill
        height: 100%
        border-radius: 1em
        background-color: var(--primary)
        transition: width 0.2s ease

        &--done
          background-color: var(--success, var(--primary))

        &--error
          background-color: var(--danger, red)

    &__status
      display: flex
      justify-content: space-between
      align-items: center
      gap: 1em
      font-size: 0.85em
      color: var(--text-light)

      &--error
        color: var(--danger, red)

  &__input
    display: none
</style>
