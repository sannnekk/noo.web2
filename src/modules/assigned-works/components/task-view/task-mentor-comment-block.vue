<template>
  <rich-comment-block
    v-model:content="model"
    class="task-mentor-comment-block"
    title="Комментарий куратора"
    placeholder="Введите комментарий куратора здесь..."
    media-category="assigned-work-mentor-rich-text"
    with-snippets
    :readonly="readonly"
  />
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import richCommentBlock from '../rich-comment-block.vue'

interface Props {
  readonly?: boolean
}

defineProps<Props>()

const model = defineModel<IRichText | null>('comment', { default: null })
</script>
