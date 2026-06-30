<template>
  <noo-base-modal
    v-model:is-open="isOpen"
    full-width
    :close-on-outside-click="false"
  >
    <template #title>
      <noo-title :size="3">Обрезка изображения</noo-title>
    </template>
    <template #content>
      <div
        v-if="imageSrc"
        class="noo-file-crop-modal__cropper-wrapper"
      >
        <Cropper
          ref="cropperRef"
          :src="imageSrc"
          :stencil-props="stencilProps"
          class="noo-file-crop-modal__cropper"
        />
      </div>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="onCancel"
      >
        Отмена
      </noo-button>
      <noo-button
        variant="primary"
        :is-loading="isProcessing"
        @click="onConfirm"
      >
        Применить
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

interface Props {
  file: File | null
  aspectRatio?: number
}

interface Emits {
  (e: 'confirm', file: File): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const imageSrc = ref<string | null>(null)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const isProcessing = ref(false)

const stencilProps = computed(() =>
  props.aspectRatio
    ? { aspectRatio: props.aspectRatio, movable: true, resizable: true }
    : { movable: true, resizable: true }
)

watch(
  () => props.file,
  (file) => {
    revokeImage()
    imageSrc.value = file ? URL.createObjectURL(file) : null
  },
  { immediate: true }
)

onBeforeUnmount(revokeImage)

function revokeImage() {
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = null
  }
}

function onCancel() {
  emit('cancel')
  isOpen.value = false
}

async function onConfirm() {
  const cropper = cropperRef.value
  const sourceFile = props.file

  if (!cropper || !sourceFile) {
    isOpen.value = false

    return
  }

  isProcessing.value = true

  try {
    const result = cropper.getResult() as
      { canvas?: HTMLCanvasElement } | undefined
    const canvas = result?.canvas

    if (!canvas) {
      emit('cancel')

      return
    }

    const blob = await canvasToBlob(canvas, sourceFile.type)
    const cropped = new File([blob], sourceFile.name, {
      type: sourceFile.type || blob.type,
      lastModified: Date.now()
    })

    emit('confirm', cropped)
  } finally {
    isProcessing.value = false
    isOpen.value = false
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Empty cropped canvas')),
      type || 'image/png'
    )
  })
}
</script>

<style lang="sass" scoped>
.noo-file-crop-modal
  &__cropper-wrapper
    background-color: var(--background)
    border-radius: var(--border-radius)
    overflow: hidden

  &__cropper
    height: min(60vh, 600px)
</style>
