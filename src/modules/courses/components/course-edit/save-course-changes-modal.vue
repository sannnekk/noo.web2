<template>
  <noo-base-modal
    v-model:is-open="isOpenModel"
    :full-width="showCourseChanges"
  >
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
      <noo-collapsable-block v-if="showCourseChanges">
        <template #collapsed>
          <noo-text-block>
            Изменений курса:
            {{ courseChangesCount }}
          </noo-text-block>
        </template>
        <template #visible>
          <course-patch-list
            :patch="courseEditStore.coursePatchGenerator!.generate()"
            :original="courseEditStore.coursePatchGenerator!.getOriginal()"
          />
        </template>
      </noo-collapsable-block>
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
        @click="onSave()"
      >
        Сохранить
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCourseEditStore } from '../../stores/course-edit.store'
import CoursePatchList from './course-patch-list.vue'

const isOpenModel = defineModel<boolean>('isOpen', {
  default: false
})

const courseEditStore = useCourseEditStore()
const courseChangesCount = ref(0)

const isCreateMode = computed(() => courseEditStore.mode === 'create')
const hasChanges = computed(() => courseEditStore.hasUnsavedChanges)
const showCourseChanges = computed(
  () => !isCreateMode.value && courseChangesCount.value > 0
)

const canBeSaved = computed(() => {
  return isCreateMode.value || hasChanges.value
})

watch(isOpenModel, () => {
  courseChangesCount.value =
    courseEditStore.coursePatchGenerator?.countChanges() ?? 0
})

async function onSave(): Promise<void> {
  if (!canBeSaved.value) {
    return
  }

  isOpenModel.value = false
  await courseEditStore.save()
}
</script>
