<template>
  <div
    class="tree-material-list"
    :class="`tree-material-list--level-${level}`"
  >
    <noo-draggable-list
      v-model="materialsModel"
      :disabled="!props.editable"
      handle=".tree-material-list__item__drag-handle"
      group="materials"
      item-key="_key"
      @reorder="adjustOrder()"
    >
      <template #default="{ item: material }">
        <div
          class="tree-material-list__item"
          :class="{
            'tree-material-list__item--planned': material.publishAt !== null,
            'tree-material-list__item--active':
              material.publishAt === null && material.isActive,
            'tree-material-list__item--selected':
              material._key === courseEditStore.currentMaterialContentKey ||
              props.highlightedKey === material._key
          }"
          @click="selectMaterial(material._key)"
        >
          <div
            class="tree-material-list__item__active-toggle"
            @click.stop="toggleMaterialActive(material)"
          ></div>
          <div class="tree-material-list__item__drag-handle">
            <noo-icon name="drag-handle" />
          </div>
          <div class="tree-material-list__item__title">
            <div class="tree-material-list__item__title__info">
              Материал | {{ infoText(material) }}
            </div>
            <noo-title
              :size="5"
              no-margin
              :color="material.titleColor"
            >
              {{ material.title }}
            </noo-title>
          </div>
          <div
            v-if="props.editable"
            class="tree-material-list__item__actions"
          >
            <div class="tree-material-list__item__actions__remove">
              <noo-icon
                name="delete"
                hoverable
                @click.stop="removeMaterial(material)"
              />
            </div>
          </div>
        </div>
      </template>
    </noo-draggable-list>
    <div
      v-if="props.editable"
      class="tree-material-list__item tree-material-list__item__add"
    >
      <div
        class="tree-material-list__item__add__title"
        @click="addMaterial()"
      >
        Добавить материал
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CourseService } from '../../api/course.service'
import { useCourseEditStore } from '../../stores/course-edit.store'
import type { PossiblyUnsavedMaterial } from '../../types'

interface Props {
  editable?: boolean
  level: number
  highlightedKey?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  highlightedKey: null
})

const materialsModel = defineModel<PossiblyUnsavedMaterial[]>('materials', {
  type: Array as () => PossiblyUnsavedMaterial[],
  required: true
})
const courseEditStore = useCourseEditStore()

function infoText(material: PossiblyUnsavedMaterial): string {
  const parts = []

  if (material.publishAt) {
    parts.push('Запланирована публикация')
  } else if (material.isActive) {
    parts.push('Активный')
  } else {
    parts.push('Неактивный')
  }

  if (!material.contentId) {
    parts.push('Новый')
  }

  return parts.join(' | ')
}

function addMaterial(): void {
  if (!props.editable) {
    return
  }

  materialsModel.value = [
    ...materialsModel.value,
    CourseService.createMaterialDraft(materialsModel.value.length + 1)
  ]
}

function selectMaterial(materialKey: string): void {
  void courseEditStore.selectMaterial(materialKey)
}

function removeMaterial(material: PossiblyUnsavedMaterial): void {
  if (!props.editable) {
    return
  }

  courseEditStore.markMaterialRemoved(material._key, material.contentId)
  materialsModel.value = materialsModel.value.filter(
    (_material) => _material._key !== material._key
  )
}

function toggleMaterialActive(material: PossiblyUnsavedMaterial): void {
  if (!props.editable) {
    return
  }

  material.isActive = !material.isActive
}

function adjustOrder(): void {
  if (!props.editable) {
    return
  }

  materialsModel.value = materialsModel.value.map((material, index) => ({
    ...material,
    order: index + 1
  }))
}
</script>

<style scoped lang="sass">
.tree-material-list
  &__item
    border-radius: var(--border-radius)
    border: var(--light-background-color) 1px solid
    cursor: pointer
    display: flex
    gap: 0.5em
    align-items: center
    margin: 0.5em 0
    border-left: 4px solid var(--text-light)

    &--active
      border-left-color: var(--success)

    &--planned
      border-left-color: var(--warning)

    &--selected
      border-right-color: var(--lila)
      border-top-color: var(--lila)
      border-bottom-color: var(--lila)

    &:hover
      background-color: var(--light-background-color)

    &__active-toggle
      width: 0.5em
      height: 3em
      background-color: transparent
      transition: all 0.2s ease-in-out

    &__drag-handle
      cursor: grab
      padding-top: 0.2em
      user-select: none

    &__title
      flex-grow: 1
      padding: 0.5em 0.7em

      &__info
        font-size: 0.7em
        color: var(--text-light)

    &__actions
      display: flex
      flex-direction: row
      align-items: center
      gap: 0.5em
      padding-right: 0.5em

    &__add
      cursor: pointer
      border: none
      background-color: unset
      font-size: 0.8em
      border-radius: var(--border-radius)
      padding: 0.2em 0.7em

      &:hover
        background-color: var(--light-background-color)
</style>
