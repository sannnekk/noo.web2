<template>
  <div class="essay-task-container">
    <noo-title
      :size="4"
      class="assigned-works-task-view__title"
      no-margin
    >
      Ваш ответ
    </noo-title>
    <noo-richtext-editor
      v-model="model"
      :placeholder="readonly ? 'Нет ответа' : 'Введите ваш ответ здесь...'"
      :readonly="readonly"
      media-category="assigned-work-student-rich-text"
    />
  </div>
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'

interface Props {
  readonly: boolean
}

defineProps<Props>()
const model = defineModel<IRichText | null>()
</script>
