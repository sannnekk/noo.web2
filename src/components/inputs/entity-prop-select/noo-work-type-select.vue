<template>
  <noo-select-input
    v-model="model"
    :label="label"
    :options="workTypes"
    :readonly="readonly"
  />
</template>

<script setup lang="ts">
import { workTypes } from '@/modules/works/constants'

interface Props {
  label?: string
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  label: 'Тип работы'
})

const model = defineModel<string | null>('modelValue', {
  default: null
})
</script>
