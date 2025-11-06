<template>
  <noo-base-modal v-model:is-open="isOpen">
    <template #title>
      <noo-search-input v-model="search" />
    </template>
    <template #content>
      <div class="material-search-modal__items">
        <div
          v-for="material in foundMaterials"
          :key="material.id"
          class="material-search-modal__items__item"
        >
          <noo-inline-link
            class="material-search-modal__items__item__link"
            :to="{
              name: 'courses.detail.material',
              params: {
                materialId: material.id
              }
            }"
            @click="isOpen = false"
          >
            {{ material.title }}
          </noo-inline-link>
        </div>
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="secondary"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import type {
  CourseChapterEntity,
  CourseMaterialEntity
} from '../api/course.types'
import { searchMaterials } from '../utils'

interface Props {
  chapters?: null | CourseChapterEntity[]
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const search = shallowRef<string>('')

const foundMaterials = shallowRef<CourseMaterialEntity[]>([])

watch(
  () => search.value,
  (newSearch) => {
    foundMaterials.value =
      newSearch.length < 2
        ? []
        : searchMaterials(props.chapters ?? [], newSearch)
  }
)
</script>

<style scoped lang="sass">
.material-search-modal
  &__items
    padding: 0.5em 0
</style>
