<template>
  <div class="word-task-container">
    <noo-text-input
      v-model="model"
      label="Ваш ответ"
      :validators="[(value) => maxLength(value, 100)]"
      :readonly="readonly"
    />
    <noo-text-block
      dimmed
      size="small"
    >
      Это задание в формате нескольких символов. Здесь не требуется длинный
      ответ или загрузка файла. Регистр и пробелы не влияют на проверку.
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { maxLength } from '@/core/validators/string.utils'

interface Props {
  readonly: boolean
}

defineProps<Props>()
const model = defineModel<string | null>()
</script>
