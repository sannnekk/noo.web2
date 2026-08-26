<template>
  <div
    ref="root"
    class="noo-tiptap-comment-popover"
    :style="anchorStyle"
  >
    <noo-dialog v-model:is-open="isOpen">
      <template #content="{ close }">
        <div class="noo-tiptap-menu noo-tiptap-comment-popover__body">
          <div
            v-if="readonly"
            class="noo-tiptap-comment-popover__type"
            :style="{ '--noo-richtext-comment-color': color }"
          >
            {{ typeLabel }}
          </div>
          <div
            v-else
            class="noo-tiptap-comment-popover__types"
          >
            <button
              v-for="commentType in types"
              :key="commentType.key"
              type="button"
              class="noo-tiptap-comment-popover__type"
              :class="{
                'noo-tiptap-comment-popover__type--active':
                  commentType.key === type
              }"
              :style="{ '--noo-richtext-comment-color': commentType.color }"
              @click="type = commentType.key"
            >
              {{ commentType.label }}
            </button>
          </div>

          <p
            v-if="readonly"
            class="noo-tiptap-comment-popover__content"
          >
            {{ content || 'Без описания' }}
          </p>
          <noo-textarea
            v-else
            v-model="content"
            placeholder="Комментарий..."
          />

          <div
            v-if="!readonly"
            class="noo-tiptap-menu__actions"
          >
            <noo-button
              variant="danger-inline"
              size="small"
              @click="(emit('remove'), close())"
            >
              Удалить
            </noo-button>
            <noo-button
              size="small"
              :disabled="!type"
              @click="save(close)"
            >
              Сохранить
            </noo-button>
          </div>
        </div>
      </template>
    </noo-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import type { RichtextComment, RichtextCommentType } from './extensions/comment'
import { commentColor } from './richtext-comment.utils'
import type { CommentAnchor } from './richtext-comments.context'

interface Props {
  types: RichtextCommentType[]
  comment: RichtextComment
  anchor: CommentAnchor
  /** A reader who may look at the comment but not change it. */
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [comment: Omit<RichtextComment, 'id'>]
  remove: []
  close: []
  /** Announced as it is picked, so an unsaved region can be recoloured. */
  'update:type': [type: string]
}>()

const root = useTemplateRef<HTMLElement>('root')
const isOpen = ref(true)
const type = ref(props.comment.type)
const content = ref(props.comment.content)

const color = computed(() => commentColor(props.types, type.value))
const typeLabel = computed(
  () => props.types.find((item) => item.key === type.value)?.label ?? ''
)

const anchorStyle = computed(() => ({
  top: `${props.anchor.top}px`,
  left: `${props.anchor.left}px`
}))

watch(type, (picked) => emit('update:type', picked))

// Closing the underlying dialog (esc / outside click) tears down the popover.
watch(isOpen, (opened) => {
  if (!opened) {
    emit('close')
  }
})

// The popover is pinned to the viewport coordinates the comment had when it was
// opened, so any scroll leaves it pointing at nothing. Closing it beats chasing
// the comment across the page.
function closeOnScroll(event: Event) {
  if (!root.value?.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => window.addEventListener('scroll', closeOnScroll, true))
onBeforeUnmount(() => window.removeEventListener('scroll', closeOnScroll, true))

function save(close: () => void) {
  emit('save', { type: type.value, content: content.value })
  close()
}
</script>

<style scoped lang="sass">
@use './tiptap-menu.sass'

.noo-tiptap-comment-popover
  position: fixed
  z-index: 1000
  // Flex, so the dialog's empty inline-flex trigger does not sit on a baseline
  // and push the panel a line's worth of leading away from the comment.
  display: flex

  &__body
    min-width: 16em
    max-width: 22em

  &__types
    display: flex
    flex-wrap: wrap
    gap: 0.4em

  &__type
    font-family: inherit
    font-size: 0.8em
    padding: 0.25em 0.7em
    border-radius: var(--border-radius)
    border: 1px solid var(--noo-richtext-comment-color, var(--border-color))
    background-color: color-mix(in srgb, var(--noo-richtext-comment-color, transparent) 20%, transparent)
    color: var(--form-text-color)
    cursor: pointer

    &--active
      background-color: color-mix(in srgb, var(--noo-richtext-comment-color, transparent) 60%, transparent)
      font-weight: 600

  &__content
    margin: 0
    font-size: 0.85em
    white-space: pre-wrap
    color: var(--form-text-color)
</style>
