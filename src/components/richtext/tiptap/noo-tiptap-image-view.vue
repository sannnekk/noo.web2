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
      v-if="status === 'loaded' && (isCommentable || comments.length)"
      ref="overlay"
      class="noo-richtext-image-view__overlay"
      :class="{ 'noo-richtext-image-view__overlay--drawing': isCommentable }"
      @pointerdown="startDrawing"
      @pointermove="keepDrawing"
      @pointerup="finishDrawing"
      @pointercancel="cancelDrawing"
    >
      <button
        v-for="comment in comments"
        :key="comment.id"
        type="button"
        class="noo-richtext-image-view__region"
        :style="regionStyle(comment)"
        :title="comment.content"
        @click="open(comment)"
      />
      <div
        v-if="draft"
        class="noo-richtext-image-view__region noo-richtext-image-view__region--draft"
        :style="regionStyle(draft)"
      />
    </div>
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
    <noo-tiptap-comment-popover
      v-if="target"
      :key="target.comment.id"
      :types="commentTypes"
      :comment="target.comment"
      :anchor="target.anchor"
      :readonly="!isCommentable"
      @save="saveComment"
      @remove="removeComment"
      @close="target = null"
    />
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import { newUlid } from '@/core/utils/id.utils'
import { MediaService } from '@/modules/media/api/media.service'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { computed, inject, ref, useTemplateRef } from 'vue'
import type { RichtextComment } from './extensions/comment'
import type { CommentAnchor } from './noo-tiptap-comment-popover.vue'
import type {
  RichtextImageComment,
  RichtextRect
} from './richtext-comment.utils'
import {
  commentColor,
  isRectUsable,
  normalizeRect
} from './richtext-comment.utils'
import { richtextCommentsKey } from './richtext-comments.context'

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

// Node views live outside the editor's template, so the commenting setup comes
// through inject. An editor that never provides it simply has commenting off.
const comments = computed<RichtextImageComment[]>(
  () => props.node.attrs.comments ?? []
)
const commentsContext = inject(richtextCommentsKey, null)
const commentTypes = computed(() => commentsContext?.types.value ?? [])
const isCommentable = computed(
  () => !!commentsContext?.commentable.value && commentTypes.value.length > 0
)

interface ImageCommentTarget {
  comment: RichtextImageComment
  anchor: CommentAnchor
}

const overlay = useTemplateRef<HTMLElement>('overlay')
const target = ref<ImageCommentTarget | null>(null)
const drawStart = ref<{ x: number; y: number } | null>(null)
const draft = ref<RichtextRect | null>(null)

function regionStyle(rect: RichtextRect & { type?: string }) {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
    '--noo-richtext-comment-color':
      commentColor(commentTypes.value, rect.type) ?? 'var(--text-light)'
  }
}

function startDrawing(event: PointerEvent) {
  // A press that landed on an existing region is a click on that comment; only
  // the bare overlay starts a new box, or `preventDefault` below would swallow
  // the region's click event.
  if (
    !isCommentable.value ||
    event.button !== 0 ||
    event.target !== event.currentTarget
  ) {
    return
  }

  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drawStart.value = fractionOf(event)
  draft.value = null
}

function keepDrawing(event: PointerEvent) {
  if (drawStart.value) {
    draft.value = normalizeRect(drawStart.value, fractionOf(event))
  }
}

function finishDrawing(event: PointerEvent) {
  const start = drawStart.value

  cancelDrawing()

  if (!start) {
    return
  }

  const rect = normalizeRect(start, fractionOf(event))
  const [firstType] = commentTypes.value

  // Anything smaller reads as a stray click on the picture, not a region.
  if (!isRectUsable(rect) || !firstType) {
    return
  }

  open({ id: newUlid(), type: firstType.key, content: '', ...rect })
}

function cancelDrawing() {
  drawStart.value = null
  draft.value = null
}

function open(comment: RichtextImageComment) {
  target.value = { comment, anchor: anchorOf(comment) }
}

function saveComment(comment: Omit<RichtextComment, 'id'>) {
  if (!target.value) {
    return
  }

  const saved = { ...target.value.comment, ...comment }

  props.updateAttributes({
    comments: [...withoutComment(saved.id), saved]
  })
  target.value.comment = saved
}

function removeComment() {
  if (!target.value) {
    return
  }

  const rest = withoutComment(target.value.comment.id)

  props.updateAttributes({ comments: rest.length ? rest : null })
}

function withoutComment(id: string): RichtextImageComment[] {
  return comments.value.filter((comment) => comment.id !== id)
}

function fractionOf(event: PointerEvent): { x: number; y: number } {
  const box = overlay.value?.getBoundingClientRect()

  if (!box?.width || !box.height) {
    return { x: 0, y: 0 }
  }

  return {
    x: (event.clientX - box.left) / box.width,
    y: (event.clientY - box.top) / box.height
  }
}

function anchorOf(rect: RichtextRect): CommentAnchor {
  const box = overlay.value?.getBoundingClientRect()

  if (!box) {
    return { top: 0, left: 0 }
  }

  return {
    top: box.top + (rect.y + rect.height) * box.height,
    left: box.left + rect.x * box.width
  }
}
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

  &__overlay
    position: absolute
    inset: 0
    // Transparent to the pointer by default so the picture still behaves like
    // part of the text; only the regions themselves are clickable.
    pointer-events: none

    &--drawing
      pointer-events: auto
      cursor: crosshair
      user-select: none

  &__region
    position: absolute
    pointer-events: auto
    padding: 0
    border: 2px solid var(--noo-richtext-comment-color)
    border-radius: 2px
    background-color: color-mix(in srgb, var(--noo-richtext-comment-color) 20%, transparent)
    cursor: pointer

    &:hover
      background-color: color-mix(in srgb, var(--noo-richtext-comment-color) 40%, transparent)

    &--draft
      pointer-events: none
      border-style: dashed

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
