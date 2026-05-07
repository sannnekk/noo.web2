<template>
  <div class="noo-file-uploader">
    <div
      v-if="label"
      class="noo-file-uploader__label"
    >
      {{ label }}
    </div>

    <div
      v-if="entries.length > 0"
      class="noo-file-uploader__list"
    >
      <noo-file-card
        v-for="entry in entries"
        :key="entry.key"
        :name="entry.name"
        :extension="entry.extension"
        :size="entry.size"
        :thumbnail="entry.thumbnail"
        :progress="entry.progress"
        :error="entry.error"
        :clickable="entry.previewable"
        @preview="onPreviewEntry(entry)"
        @remove="onRemoveEntry(entry)"
      />
    </div>

    <div
      v-if="canAddMore"
      class="noo-file-uploader__dropzone"
      :class="{ 'noo-file-uploader__dropzone--active': isDragging }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="noo-file-uploader__dropzone__hint">
        <span>{{ dropzoneHintText }}</span>
        <span class="noo-file-uploader__dropzone__hint__sub">
          {{ allowedHintText }} · до {{ maxCount }}
          {{ pluralize(maxCount, ['файла', 'файлов', 'файлов']) }}
        </span>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      class="noo-file-uploader__input"
      :accept="acceptAttribute"
      :multiple="maxCount > 1"
      @change="onInputChange"
    />

    <noo-file-crop-modal
      v-if="cropTarget"
      v-model:is-open="isCropOpen"
      :file="cropTarget"
      :aspect-ratio="cropRatio"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />

    <noo-file-preview-modal
      v-model:is-open="isPreviewOpen"
      :file="previewedFile"
    />
  </div>
</template>

<script lang="ts" setup>
import { isApiError, type RequestProgress } from '@/core/api/api.utils'
import { appConfig } from '@/core/config/app.config'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
import { MediaService } from '@/modules/media/api/media.service'
import type {
  MediaCategory,
  MediaEntity
} from '@/modules/media/api/media.types'
import { computed, reactive, ref } from 'vue'
import {
  buildAcceptAttribute,
  detectFileKind,
  type FileKind,
  fileExtension,
  isAllowedKind
} from './file-kind.utils'

interface Props {
  label?: string
  types: FileKind[]
  maxCount: number
  crop?: boolean
  cropRatio?: number
  category: MediaCategory
  entityId?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  crop: false,
  cropRatio: undefined,
  entityId: undefined
})

const files = defineModel<MediaEntity[]>('modelValue', { required: true })

const globalUiStore = useGlobalUIStore()

interface LocalUpload {
  id: string
  file: File
  progress: number
  error: string | null
}

const localUploads = reactive<LocalUpload[]>([])

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const cropTarget = ref<File | null>(null)
const isCropOpen = ref(false)
let cropResolver: ((file: File | null) => void) | null = null

const previewedFile = ref<MediaEntity | null>(null)
const isPreviewOpen = ref(false)

const acceptAttribute = computed(() => buildAcceptAttribute(props.types))

const totalCount = computed(() => files.value.length + localUploads.length)
const canAddMore = computed(() => totalCount.value < props.maxCount)

const dropzoneHintText = computed(() =>
  isDragging.value
    ? 'Отпустите, чтобы загрузить'
    : 'Перетащите файл или нажмите для выбора'
)

const allowedHintText = computed(() => {
  const labels: Record<FileKind, string> = {
    image: 'Изображения',
    pdf: 'PDF'
  }

  return props.types.map((kind) => labels[kind]).join(', ')
})

interface DisplayEntry {
  key: string
  name: string
  extension: string
  size: number
  thumbnail: string | null
  progress: number | undefined
  error: string | null
  previewable: boolean
  source: { kind: 'media'; media: MediaEntity } | { kind: 'local'; id: string }
}

const entries = computed<DisplayEntry[]>(() => {
  const fromFiles: DisplayEntry[] = files.value.map((media) => ({
    key: `media:${media.id}`,
    name: media.actualName ?? media.name,
    extension: media.extension,
    size: media.size,
    thumbnail: thumbnailFor(media),
    progress: undefined,
    error: null,
    previewable: detectFileKind(media) !== null,
    source: { kind: 'media', media }
  }))

  const fromLocal: DisplayEntry[] = localUploads.map((local) => ({
    key: `local:${local.id}`,
    name: local.file.name,
    extension: fileExtension(local.file),
    size: local.file.size,
    thumbnail: null,
    progress: local.error ? undefined : local.progress,
    error: local.error,
    previewable: false,
    source: { kind: 'local', id: local.id }
  }))

  return [...fromFiles, ...fromLocal]
})

function openPicker() {
  fileInputRef.value?.click()
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])

  input.value = ''
  void handleFiles(picked)
}

function onDragEnter() {
  if (canAddMore.value) {
    isDragging.value = true
  }
}

function onDragOver() {
  if (canAddMore.value) {
    isDragging.value = true
  }
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const dropped = Array.from(event.dataTransfer?.files ?? [])

  void handleFiles(dropped)
}

async function handleFiles(picked: File[]) {
  if (picked.length === 0) {
    return
  }

  const accepted: File[] = []
  let rejectedTypeCount = 0
  let rejectedSizeCount = 0

  for (const file of picked) {
    if (!isAllowedKind(file, props.types)) {
      rejectedTypeCount += 1
      continue
    }
    if (file.size > appConfig.maxFileSizeInBytes) {
      rejectedSizeCount += 1
      continue
    }
    accepted.push(file)
  }

  if (rejectedTypeCount > 0) {
    globalUiStore.createWarningToast(
      'Неподдерживаемый тип файла',
      `Пропущено файлов: ${rejectedTypeCount}`
    )
  }
  if (rejectedSizeCount > 0) {
    globalUiStore.createWarningToast(
      'Файл слишком большой',
      `Пропущено файлов: ${rejectedSizeCount}`
    )
  }

  const remainingSlots = Math.max(0, props.maxCount - totalCount.value)
  const takeable = accepted.slice(0, remainingSlots)
  const overflow = accepted.length - takeable.length

  if (overflow > 0) {
    globalUiStore.createWarningToast(
      'Превышен лимит файлов',
      `Можно добавить не больше ${props.maxCount}`
    )
  }

  for (const file of takeable) {
    let candidate: File | null = file

    if (props.crop && detectFileKind(file) === 'image') {
      candidate = await requestCrop(file)
      if (!candidate) {
        continue
      }
    }

    void startUpload(candidate)
  }
}

function requestCrop(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    cropTarget.value = file
    isCropOpen.value = true
    cropResolver = resolve
  })
}

function onCropConfirm(cropped: File) {
  cropResolver?.(cropped)
  cropResolver = null
  cropTarget.value = null
}

function onCropCancel() {
  cropResolver?.(null)
  cropResolver = null
  cropTarget.value = null
}

async function startUpload(file: File) {
  const local: LocalUpload = reactive({
    id: uid(),
    file,
    progress: 0,
    error: null
  })

  localUploads.push(local)

  const onProgress = (event: RequestProgress) => {
    if (event.total) {
      local.progress = Math.round((event.loaded / event.total) * 100)
    }
  }

  const response = await MediaService.upload(file, {
    category: props.category,
    entityId: props.entityId,
    onProgress
  })

  if (isApiError(response)) {
    local.error = response.error.description ?? 'Ошибка загрузки'
    globalUiStore.createApiErrorToast(
      'Не удалось загрузить файл',
      response.error
    )

    return
  }

  if (!response.data) {
    local.error = 'Пустой ответ сервера'

    return
  }

  releaseLocal(local)
  files.value = [...files.value, response.data]
}

function releaseLocal(local: LocalUpload) {
  const index = localUploads.findIndex((item) => item.id === local.id)

  if (index !== -1) {
    localUploads.splice(index, 1)
  }
}

function onPreviewEntry(entry: DisplayEntry) {
  const source = entry.source

  if (source.kind !== 'media' || !entry.previewable) {
    return
  }
  previewedFile.value = source.media
  isPreviewOpen.value = true
}

async function onRemoveEntry(entry: DisplayEntry) {
  const source = entry.source

  if (source.kind === 'local') {
    const local = localUploads.find((item) => item.id === source.id)

    if (local) {
      releaseLocal(local)
    }

    return
  }

  const media = source.media

  files.value = files.value.filter((item) => item.id !== media.id)

  const response = await MediaService.delete(media.id)

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast('Не удалось удалить файл', response.error)
    files.value = [...files.value, media]
  }
}

function thumbnailFor(media: MediaEntity): string | null {
  if (detectFileKind(media) !== 'image') {
    return null
  }

  return media.url
}

function pluralize(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0]
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1]
  }

  return forms[2]
}
</script>

<style lang="sass" scoped>
.noo-file-uploader
  display: flex
  flex-direction: column
  gap: 0.5em

  &__label
    font-size: 0.85em
    color: var(--text-light)

  &__list
    display: flex
    flex-direction: column
    gap: 0.5em

  &__dropzone
    display: flex
    align-items: center
    justify-content: center
    padding: 1.25em
    border: 2px dashed var(--border-color)
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
      gap: 0.25em
      font-size: 0.85em

      &__sub
        font-size: 0.75em
        color: var(--text-light)

  &__input
    display: none
</style>
