<template>
  <form-input
    v-model="valueModel.value"
    type="number"
    label="Значение ячейки (в %)"
    :min="0"
    :max="100"
  />
</template>

<script setup lang="ts">
import type { TableCell } from '@/core/data/entities/TableCell'
import { computed, watch } from 'vue'

interface Props {
  modelValue: TableCell
  isValid: [boolean, string?]
}

interface Emits {
  (event: 'update:modelValue', value: TableCell): void
  (event: 'update:isValid', value: [boolean, string?]): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const valueModel = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (value.value === '') {
      value.value = '0'
    }

    emits('update:modelValue', value)
  }
})

const isValidModel = computed({
  get: () => props.isValid,
  set: (value) => { emits('update:isValid', value); }
})

watch(valueModel, validate, { immediate: true, deep: true })

function validate() {
  if (parseFloat(valueModel.value.value) < 0) {
    isValidModel.value = [false, 'Значение не может быть меньше 0']
  } else {
    isValidModel.value = [true]
  }
}
</script>
