<template>
  <div class="text-task-container">
    <noo-richtext-editor
      v-model="model"
      :placeholder="readonly ? 'Нет ответа' : 'Введите ваш ответ здесь...'"
      :readonly="readonly"
      media-category="assigned-work-student-rich-text"
      :commentable="commentable"
      :comment-types="answerCommentTypes"
    />
  </div>
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import { answerCommentTypes } from '../answer-comment-types'

interface Props {
  readonly: boolean
  /** Lets a mentor mark mistakes up inside the answer itself. */
  commentable?: boolean
}

defineProps<Props>()
const model = defineModel<IRichText | null>()
</script>
