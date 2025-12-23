<template>
  <noo-grid-layout
    v-if="currentContent"
    :cols="6"
  >
    <noo-grid-layout-item
      :col="1"
      :row="1"
      :colspan="6"
    >
      <noo-richtext-editor
        v-model="currentContent.content"
        label="Текст материала"
      />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="1"
      :colspan="4"
    >
      <!-- TODO: work assignments select, media select, poll select, video select, etc -->
    </noo-grid-layout-item>
  </noo-grid-layout>
  <noo-text-block v-else>
    Выберите материал для редактирования.
  </noo-text-block>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCourseEditStore } from '../stores/course-edit.store'

const courseEditStore = useCourseEditStore()

const currentContent = computed({
  get() {
    const key = courseEditStore.currentMaterialContentKey

    if (key) {
      return courseEditStore.materialContents[key]
    }

    return null
  },
  set(value) {
    const key = courseEditStore.currentMaterialContentKey

    if (key && value) {
      courseEditStore.materialContents[key] = value
    }
  }
})
</script>

<style scoped lang="sass"></style>
