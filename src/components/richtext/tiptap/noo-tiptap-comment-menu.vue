<template>
  <!-- BubbleMenu tears its own root out of the DOM on mount and re-parents it
       next to the editor. Vue keeps using that vnode's element as the anchor for
       patching whatever sits beside it, so it is given an empty host of its own
       to leave behind rather than being a sibling of anything else. -->
  <div class="noo-tiptap-comment-menu__host">
    <bubble-menu
      :editor="editor"
      plugin-key="richtext-comment"
      :should-show="shouldShow"
      :options="{ placement: 'top', offset: 8 }"
    >
      <div class="noo-tiptap-comment-menu">
        <button
          v-for="type in types"
          :key="type.key"
          type="button"
          class="noo-tiptap-comment-menu__type"
          :style="{ '--noo-richtext-comment-color': type.color }"
          @click="add(type)"
        >
          {{ type.label }}
        </button>
      </div>
    </bubble-menu>
  </div>
</template>

<script setup lang="ts">
import { newUlid } from '@/core/utils/id.utils'
import type { EditorState } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { RichtextComment, RichtextCommentType } from './extensions/comment'

interface Props {
  editor: Editor
  types: RichtextCommentType[]
}

const props = defineProps<Props>()

const emit = defineEmits<{ added: [comment: RichtextComment] }>()

// The stock `shouldShow` bails out on a non-editable editor, which is exactly
// the case this menu exists for, so it has to be replaced wholesale.
function shouldShow({ state }: { state: EditorState }): boolean {
  return !state.selection.empty
}

/**
 * The mark is applied straight away, before the comment has any text: it pins
 * down the selection, which the popover's own inputs would otherwise collapse
 * the moment they take focus.
 */
function add(type: RichtextCommentType) {
  const comment: RichtextComment = {
    id: newUlid(),
    type: type.key,
    content: ''
  }

  props.editor.commands.setComment(comment)
  emit('added', comment)
}
</script>

<style scoped lang="sass">
.noo-tiptap-comment-menu__host
  display: contents

.noo-tiptap-comment-menu
  display: flex
  gap: 0.3em
  padding: 0.3em
  border-radius: var(--border-radius)
  background-color: var(--form-background)
  border: 1px solid var(--border-color)
  box-shadow: var(--block-shadow)

  &__type
    font-family: inherit
    font-size: 0.75em
    white-space: nowrap
    padding: 0.3em 0.7em
    border-radius: var(--border-radius)
    border: 1px solid var(--noo-richtext-comment-color)
    background-color: color-mix(in srgb, var(--noo-richtext-comment-color) 25%, transparent)
    color: var(--form-text-color)
    cursor: pointer

    &:hover
      background-color: color-mix(in srgb, var(--noo-richtext-comment-color) 55%, transparent)
</style>
