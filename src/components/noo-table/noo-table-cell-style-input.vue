<template>
  <div class="cell-style-input">
    <div class="cell-style-input__background">
      <form-color-select
        v-model="model.background"
        label="Цвет фона"
        allow-empty
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableCell } from '@/core/data/entities/TableCell'
import { computed } from 'vue'

interface Props {
  modelValue: TableCell
}

type Emits = (event: 'update:modelValue', value: TableCell) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => { emits('update:modelValue', value); }
})
</script>

<style scoped></style>
