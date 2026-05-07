<template>
  <div
    class="noo-file-card"
    :class="{
      'noo-file-card--clickable': clickable && !error,
      'noo-file-card--errored': !!error
    }"
    @click="onClick"
  >
    <div class="noo-file-card__thumbnail">
      <noo-loader-icon
        v-if="isUploading || isDownloading"
        class="noo-file-card__thumbnail__loader"
      />
      <img
        v-else-if="thumbnail"
        :src="thumbnail"
        class="noo-file-card__thumbnail__image"
        :alt="name"
      />
      <noo-icon
        v-else
        :name="iconName"
      />
      <div
        v-if="isUploading"
        class="noo-file-card__thumbnail__progress"
      >
        <div
          class="noo-file-card__thumbnail__progress__bar"
          :style="{ width: `${clampedProgress}%` }"
        />
      </div>
    </div>
    <div class="noo-file-card__info">
      <div
        class="noo-file-card__info__name"
        :title="name"
      >
        {{ name }}
      </div>
      <div class="noo-file-card__info__meta">
        <span v-if="error">{{ error }}</span>
        <span v-else>{{ humanSize }}</span>
      </div>
    </div>
    <button
      v-if="removable"
      type="button"
      class="noo-file-card__remove"
      :aria-label="`Удалить файл ${name}`"
      @click.stop="emit('remove')"
    >
      <noo-icon name="close" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { IconName } from '@/components/icons/noo-icon.vue'
import { isApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { triggerDownload } from '@/core/utils/download.utils'
import { MediaService } from '@/modules/media/api/media.service'
import type { MediaEntity } from '@/modules/media/api/media.types'
import { computed, ref } from 'vue'

interface Props {
  name: string
  extension: string
  size: number
  thumbnail?: string | null
  progress?: number
  error?: string | null
  clickable?: boolean
  removable?: boolean
  media?: MediaEntity | null
  downloadable?: boolean
}

interface Emits {
  (e: 'preview'): void
  (e: 'remove'): void
}

const props = withDefaults(defineProps<Props>(), {
  thumbnail: null,
  progress: undefined,
  error: null,
  clickable: true,
  removable: true,
  media: null,
  downloadable: false
})

const emit = defineEmits<Emits>()

const globalUiStore = useGlobalUIStore()

const isDownloading = ref(false)

const isUploading = computed(() => props.progress !== undefined && !props.error)

const clampedProgress = computed(() =>
  Math.max(0, Math.min(100, props.progress ?? 0))
)

const iconName = computed<IconName>(() => {
  switch (props.extension.toLowerCase().replace(/^\./, '')) {
    case 'pdf':
      return 'pdf-file'
    case 'png':
      return 'png-file'
    case 'jpg':
    case 'jpeg':
      return 'jpg-file'
    default:
      return 'pdf-file'
  }
})

const humanSize = computed(() => formatBytes(props.size))

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} ГБ`
}

function onClick() {
  if (!props.clickable || props.error) {
    return
  }

  if (props.downloadable && props.media) {
    void download(props.media)

    return
  }

  emit('preview')
}

async function download(media: MediaEntity) {
  if (isDownloading.value) {
    return
  }

  isDownloading.value = true

  try {
    const response = await MediaService.getDownloadUrl(media.id)

    if (isApiError(response)) {
      globalUiStore.createApiErrorToast(
        'Не удалось скачать файл',
        response.error
      )

      return
    }

    if (!response.data?.url) {
      return
    }

    await triggerDownload(response.data.url, media.actualName ?? media.name)
  } catch (error) {
    globalUiStore.createWarningToast(
      'Не удалось скачать файл',
      error instanceof Error ? error.message : undefined
    )
  } finally {
    isDownloading.value = false
  }
}
</script>

<style lang="sass" scoped>
.noo-file-card
  display: flex
  align-items: center
  gap: 0.75em
  padding: 0.75em
  background-color: var(--form-background)
  border: 1px solid var(--border-color)
  border-radius: var(--border-radius)
  user-select: none

  &--clickable
    cursor: pointer

    &:hover
      border-color: var(--lila)

  &--errored
    border-color: var(--danger)

    .noo-file-card__info__meta
      color: var(--danger)

  &__thumbnail
    position: relative
    flex-shrink: 0
    display: flex
    align-items: center
    justify-content: center
    background-color: var(--background)
    overflow: hidden
    font-size: 3em
    width: 1.5em
    max-height: 2.3em

    &__image
      width: 100%
      height: 100%
      object-fit: cover

    &__loader
      font-size: 1.2em

    &__progress
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      height: 4px
      background-color: rgba(0, 0, 0, 0.15)

      &__bar
        height: 100%
        background-color: var(--primary)
        transition: width 0.15s linear

  &__info
    flex: 1
    min-width: 0

    &__name
      font-size: 0.9em
      font-weight: 500
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

    &__meta
      font-size: 0.75em
      color: var(--text-light)
      margin-top: 0.15em

  &__remove
    flex-shrink: 0
    background: none
    border: none
    cursor: pointer
    color: var(--text-light)
    padding: 0.25em
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center

    &:hover
      color: var(--danger)
      background-color: var(--background)
</style>
