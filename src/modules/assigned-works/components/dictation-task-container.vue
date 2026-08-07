<template>
  <div class="dictation-task-container">
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
