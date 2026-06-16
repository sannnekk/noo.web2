<template>
  <node-view-wrapper
    class="noo-richtext-image-view"
    :class="{ 'noo-richtext-image-view--pending': status !== 'loaded' }"
    :style="wrapperStyle"
  >
    <img
      v-show="status === 'loaded'"
      :src="currentSrc"
      :alt="alt"
      class="noo-richtext-image-view__img"
      @load="status = 'loaded'"
      @error="onError"
    />
    <div
      v-if="status === 'loading'"
      class="noo-richtext-image-view__state"
    >
      <noo-loader-icon />
    </div>
    <div
      v-else-if="status === 'error'"
      class="noo-richtext-image-view__state noo-richtext-image-view__state--error"
    >
      <span>Не удалось загрузить изображение</span>
      <noo-button
        v-if="isEditable"
        variant="danger-inline"
        size="small"
        @click="remove"
      >
        Удалить
      </noo-button>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import { MediaService } from '@/modules/media/api/media.service'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { computed, ref } from 'vue'

const props = defineProps(nodeViewProps)

const mediaId = computed<string | null>(() => props.node.attrs.mediaId)
const alt = computed<string | undefined>(
  () => props.node.attrs.alt ?? undefined
)
const isEditable = computed(() => props.editor.isEditable)

const status = ref<'loading' | 'loaded' | 'error'>(
  mediaId.value ? 'loading' : 'error'
)
const currentSrc = ref(
  mediaId.value ? MediaService.mediaRawUrl(mediaId.value) : ''
)
const hasRetried = ref(false)

// The stable /raw URL relies on the media cookie. If the tab has been open past
// the access-token TTL the cookie is stale and the first load 401s. Fall back
// once to an authenticated presigned URL: the API client's 401 interceptor
// refreshes the session (re-issuing the media cookie) and returns a fresh URL.
async function onError() {
  if (hasRetried.value || !mediaId.value) {
    status.value = 'error'

    return
  }

  hasRetried.value = true
  status.value = 'loading'

  const response = await MediaService.getDownloadUrl(mediaId.value)

  if (isApiError(response) || !response.data?.url) {
    status.value = 'error'

    return
  }

  currentSrc.value = response.data.url
}

function remove() {
  props.deleteNode()
}

// Reserve the image's natural footprint so the placeholder doesn't cause a
// layout shift once the picture finishes loading. `width: 100%` (a percentage,
// not the intrinsic pixel size) keeps the block from ever forcing the editor
// wider than its container, while `max-width` stops small images upscaling.
const wrapperStyle = computed(() => {
  const { width, height } = props.node.attrs

  if (width && height) {
    return {
      width: '100%',
      maxWidth: `${width}px`,
      aspectRatio: `${width} / ${height}`
    }
  }

  return {}
})
</script>

<style scoped lang="sass">
.noo-richtext-image-view
  display: block
  position: relative
  max-width: 100%
  box-sizing: border-box
  margin: 0.5em 0

  &--pending
    min-height: 4em

  &__img
    display: block
    width: 100%
    max-width: 100%
    height: auto
    border-radius: var(--border-radius)

  &__state
    position: absolute
    inset: 0
    display: flex
    align-items: center
    justify-content: center
    background-color: var(--light-background-color)
    border-radius: var(--border-radius)
    color: var(--form-text-color)

    &--error
      flex-direction: column
      gap: 0.5em
      color: var(--danger)
      font-size: 0.85em
      text-align: center
      padding: 0.5em
</style>
