<template>
  <select-input
    v-model="taskCheckingStrategyModel"
    :label="label"
    :options="taskCheckingStrategyOptions"
  />
</template>

<script setup lang="ts">
import type { Task } from '@/core/data/entities/Task'
import { computed } from 'vue'

interface Props {
  label: string
  modelValue: Task['checkingStrategy']
}

type Emits = (event: 'update:modelValue', value: Task['checkingStrategy']) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const taskCheckingStrategyModel = computed<Task['checkingStrategy']>({
  get: () => props.modelValue,
  set: (value) => { emits('update:modelValue', value); }
})

const taskCheckingStrategyOptions = [
  {
    label: '1 символ неверный: 0 б.',
    value: 'type1'
  },
  {
    label: '1 символ неверный: -1 б.',
    value: 'type2'
  },
  {
    label: '1 символ неверный, включая лишний/недостающий: -1 б.',
    value: 'type3'
  },
  {
    label: 'Последовательность',
    value: 'type4'
  }
]
</script>
