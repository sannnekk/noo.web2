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

<script setup lang="ts" generic="T">
import draggable from 'vuedraggable'

interface Props {
  handle?: string
  group?: string
}

defineProps<Props>()

const model = defineModel<T[]>('modelValue', {
  type: Array as () => T[],
  required: true
})
</script>
