<template>
  <div
    class="tree-material-list"
    :class="`tree-material-list--level-${level}`"
  >
    <noo-draggable-list
      v-model="materialsModel"
      :disabled="!editable"
      handle=".tree-material-list__item__drag-handle"
      group="materials"
      item-key="_key"
      @reorder="adjustOrder()"
    >
      <template #default="{ item: material }">
        <div
          class="tree-material-list__item"
          :class="{ 'tree-material-list__item--active': material.isActive }"
        >
          <div
            class="tree-material-list__item__active-toggle"
            @click="material.isActive = !material.isActive"
          ></div>
          <div class="tree-material-list__item__drag-handle">
            <noo-icon name="drag-handle" />
          </div>
          <div class="tree-material-list__item__title">
            <noo-title
              v-if="!editable"
              :size="5"
              no-margin
            >
              {{ material.title }}
            </noo-title>
            <noo-text-input
              v-else
              v-model="material.title"
              placeholder="Название материала"
            />
          </div>
          <div
            v-if="editable"
            class="tree-material-list__item__actions"
          >
            <div class="tree-material-list__item__actions__remove">
              <noo-icon
                name="delete"
                hoverable
                @click="removeMaterial(material._key)"
              />
            </div>
          </div>
        </div>
      </template>
    </noo-draggable-list>
    <div class="tree-material-list__item tree-material-list__item__add">
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
import { uid } from '@/core/utils/id.utils'
import type { PossiblyUnsavedMaterial } from '../../types'

interface Props {
  editable?: boolean
  level: number
}

defineProps<Props>()

const materialsModel = defineModel<PossiblyUnsavedMaterial[]>('materials', {
  type: Array as () => PossiblyUnsavedMaterial[],
  required: true
})

function addMaterial(): void {
  materialsModel.value = [
    ...materialsModel.value,
    {
      _entityName: 'CourseMaterial',
      order: materialsModel.value.length + 1,
      _key: uid(),
      title: 'Новый материал ' + (materialsModel.value.length + 1),
      titleColor: null,
      contentId: null,
      chapterId: '',
      isActive: false,
      publishAt: null
    }
  ]
}

function removeMaterial(key: string): void {
  materialsModel.value = materialsModel.value.filter(
    (material) => material._key !== key
  )
}

function adjustOrder(): void {
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
    border-left: 4px solid var(--danger)

    &--active
      border-left-color: var(--success)

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
