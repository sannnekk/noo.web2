<template>
  <div class="noo-draggable-list">
    <div
      v-if="disabled"
      class="noo-draggable-list__disabled"
    >
      <div
        v-for="item in model"
        :key="(item as unknown as any)[itemKey ?? '_key']"
        :style="{ marginBottom: gap }"
      >
        <slot :item="item" />
      </div>
    </div>
    <div
      v-else
      class="noo-draggable-list__enabled"
    >
      <draggable
        v-model="model"
        :item-key="itemKey ?? '_key'"
        :handle="handle"
        :group="group"
      >
        <template #item="{ element }">
          <div :style="{ marginBottom: gap }">
            <slot :item="element as T" />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import draggable from 'vuedraggable'

interface Props {
  handle?: string
  group?: string
  itemKey?: string
  disabled?: boolean
  gap?: string
}

defineProps<Props>()

const model = defineModel<T[]>('modelValue', {
  type: Array as () => T[],
  required: true
})
</script>
