<template>
  <noo-select-input
    v-model="model"
    :label="label"
    :options="workTypes"
    :readonly="readonly"
    :errors="errors"
  />
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import type { WorkType } from '@/modules/works/api/work.types'
import { workTypes } from '@/modules/works/constants'

interface Props {
  label?: string
  readonly?: boolean
  errors?: ValidationError[]
}

withDefaults(defineProps<Props>(), {
  label: 'Тип работы'
})

const model = defineModel<WorkType | null>('modelValue', {
  default: null
})
</script>
