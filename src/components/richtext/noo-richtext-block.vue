<template>
  <!-- Rendered by the editor whose format the value names. One today; a second
       would be another branch on `$type`. -->
  <noo-tiptap-component
    v-if="value?.$type === 'tiptap'"
    :model-value="value"
    readonly
    :commentable="commentable"
    :comment-types="commentTypes"
    @update:model-value="(updated) => emit('update:value', updated)"
  />
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import type { RichtextCommentType } from './tiptap/extensions/comment'

interface Props {
  value: IRichText | null | undefined
  /** Lets the reader select text — or a region of an image — and comment on it. */
  commentable?: boolean
  /** The comment types on offer. Read once, when the editor is created. */
  commentTypes?: RichtextCommentType[]
}

// Readonly text still changes when it is commented on, so the block reports it.
type Emits = (event: 'update:value', value: IRichText | null) => void

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
