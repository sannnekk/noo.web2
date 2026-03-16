<template>
  <noo-base-modal v-model:is-open="isOpenModel">
    <template #title>
      <noo-title :size="2">
        {{ isCreateMode ? 'Сохранить курс' : 'Сохранить изменения' }}
      </noo-title>
    </template>
    <template #content>
      <noo-text-block
        v-if="isCreateMode"
        dimmed
      >
        Вы уверены, что хотите сохранить курс?
      </noo-text-block>
      <noo-text-block
        v-else-if="hasChanges"
        dimmed
      >
        Вы хотите сохранить внесенные изменения в курс?
      </noo-text-block>
      <noo-text-block
        v-else
        dimmed
      >
        Нет внесенных изменений.
      </noo-text-block>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="isOpenModel = false"
      >
        Отмена
      </noo-button>
      <noo-button
        variant="primary"
        :disabled="!canBeSaved"
        @click="void onSave()"
      >
        Сохранить
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCourseEditStore } from '../stores/course-edit.store'

const isOpenModel = defineModel<boolean>('isOpen', {
  default: false
})

const courseEditStore = useCourseEditStore()

const isCreateMode = computed(() => courseEditStore.mode === 'create')
const hasChanges = computed(() => courseEditStore.hasUnsavedChanges)

const canBeSaved = computed(() => {
  return isCreateMode.value || hasChanges.value
})

async function onSave(): Promise<void> {
  if (!canBeSaved.value) {
    return
  }

  isOpenModel.value = false
  await courseEditStore.save()
}
</script>
