<template>
  <select-input
    v-model="taskTypeModel"
    :label="label"
    :options="taskTypeOptions"
  />
</template>

<script setup lang="ts">
import type { Task } from '@/core/data/entities/Task'
import { computed } from 'vue'

interface Props {
  label: string
  modelValue: Task['type']
}

type Emits = (event: 'update:modelValue', value: Task['type']) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const taskTypeModel = computed<Task['type']>({
  get: () => props.modelValue,
  set: (value) => { emits('update:modelValue', value); }
})

const taskTypeOptions = [
  {
    label: 'Ответ в одну строку',
    value: 'word'
  },
  {
    label: 'Открытый вопрос',
    value: 'text'
  },
  {
    label: 'Сочинение',
    value: 'essay'
  },
  {
    label: 'Итоговое сочинение',
    value: 'final-essay'
  }
]
</script>
