<template>
  <draggable
    v-model="model"
    item-key="id"
    :handle="handle"
    :group="group"
  >
    <template #item="{ element }">
      <div><slot :item="element" /></div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed } from 'vue'

interface Props {
  modelValue: ({
    id: string
  } & any)[]
  handle?: string
  group?: string
}

type Emits = (event: 'update:modelValue', value: any[]) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => { emits('update:modelValue', value); }
})
</script>
