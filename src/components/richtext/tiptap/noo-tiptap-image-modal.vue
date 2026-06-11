<template>
  <span class="noo-tiptap-image-modal">
    <noo-tiptap-toolbar-button
      icon="image"
      title="Изображение"
      :disabled="!category"
      :is-loading="isUploading"
      @click="fileInput?.click()"
    />
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="noo-tiptap-image-modal__input"
      @change="onFileSelected"
    />
  </span>
</template>

<script setup lang="ts">
import { appConfig } from '@/core/config/app.config'
import { isApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { MediaService } from '@/modules/media/api/media.service'
import type { MediaCategory } from '@/modules/media/api/media.types'
import type { Editor } from '@tiptap/vue-3'
import { ref } from 'vue'

interface Props {
  editor?: Editor
  /** Required to upload — scopes the file to the right S3 bucket/access rules. */
  category?: MediaCategory
  entityId?: string
}

const props = defineProps<Props>()

const globalUI = useGlobalUIStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  // Reset so picking the same file again still fires `change`.
  input.value = ''

  if (!file || !props.editor || !props.category) {
    return
  }

  if (file.size > appConfig.maxFileSizeInBytes) {
    globalUI.createErrorToast(
      'Изображение не загружено',
      'Файл слишком большой'
    )

    return
  }

  isUploading.value = true

  // Read the natural size before upload so the node can reserve space and show a
  // loader/placeholder while the image is fetched on render.
  const size = await readImageSize(file)

  const response = await MediaService.upload(file, {
    category: props.category,
    entityId: props.entityId
  })

  isUploading.value = false

  if (isApiError(response) || !response.data) {
    globalUI.createApiErrorToast(
      'Не удалось загрузить изображение',
      isApiError(response) ? response.error : undefined
    )

    return
  }

  props.editor
    .chain()
    .focus()
    .setImage({
      mediaId: response.data.id,
      alt: response.data.name,
      width: size?.width,
      height: size?.height
    })
    .run()
}

function readImageSize(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new window.Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(url)
    }

    image.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }

    image.src = url
  })
}
</script>

<style scoped lang="sass">
.noo-tiptap-image-modal
  display: inline-flex

  &__input
    display: none
</style>
