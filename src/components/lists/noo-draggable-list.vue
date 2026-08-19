<template>
  <div class="noo-draggable-list">
    <div
      v-if="disabled"
      class="noo-draggable-list__disabled"
      :class="listClass"
    >
      <div
        v-for="(item, index) in model"
        :key="(item as unknown as any)[itemKey ?? '_key']"
        :style="{ marginBottom: gap }"
      >
        <slot
          :item="item"
          :index="index"
        />
      </div>
    </div>
    <div
      v-else
      class="noo-draggable-list__enabled"
    >
      <draggable
        v-model="model"
        :class="listClass"
        :handle="handle"
        :group="group"
        :animation="200"
        :item-key="itemKey ?? '_key'"
        @end="$emit('reorder')"
      >
        <template #item="{ element, index }">
          <div :style="{ marginBottom: gap }">
            <slot
              :item="element as T"
              :index="index"
            />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import type { DefineComponent } from 'vue'
import draggableSource from 'vuedraggable'

type DraggableProps = InstanceType<typeof draggableSource>['$props'] & {
  handle?: string
  group?: string
  animation?: number
}

interface Props {
  handle?: string
  group?: string
  itemKey?: string
  disabled?: boolean
  gap?: string
  /**
   * Class for the element the items sit directly in, so a caller can lay them out
   * as something other than a stack — a grid, say. Set from the caller's scoped
   * styles with `:deep()`, the element being rendered in here.
   */
  listClass?: string
}

type Emits = (event: 'reorder') => void

defineProps<Props>()
defineEmits<Emits>()

const model = defineModel<T[]>('modelValue', {
  type: Array as () => T[],
  required: true
})

const draggable = draggableSource as unknown as DefineComponent<DraggableProps>
</script>
