<template>
  <div class="work-assignments-form">
    <div class="work-assignments-form__content">
      <div
        v-if="!workAssignmentsModel.length"
        class="work-assignments-form__content__empty"
      >
        <noo-text-block
          dimmed
          size="small"
          inline
        >
          Пока что не присвоено ни одной работы. Добавьте первую работу, выбрав
          её в поле ниже и нажав кнопку "Добавить".
        </noo-text-block>
      </div>
      <noo-draggable-list
        v-model="workAssignmentsModel"
        item-key="_key"
        handle=".work-assignments-form__item__head"
        gap="1em"
        @reorder="() => {} /* TODO: reorder, implement position: number */"
      >
        <template #default="{ item: assignment }">
          <div class="work-assignments-form__item">
            <div class="work-assignments-form__item__head">
              <div
                v-if="assignment.work"
                class="work-assignments-form__item__head__work"
              >
                <noo-work-type-tag :type="assignment.work.type" />
                <noo-title
                  :size="4"
                  no-margin
                >
                  {{ assignment.work.title }}
                </noo-title>
                <noo-inline-link
                  :to="{
                    name: 'works.edit',
                    params: { workId: assignment.work.id }
                  }"
                  new-tab
                  size="small"
                >
                  Перейти к работе
                </noo-inline-link>
              </div>
              <div
                v-else
                class="work-assignments-form__item__head__work"
              >
                <noo-text-block
                  size="small"
                  dimmed
                >
                  Работа не найдена
                </noo-text-block>
              </div>
              <div class="work-assignments-form__item__head__remove-button">
                <noo-icon
                  name="delete"
                  @click="onRemoveWorkAssignment(assignment._key)"
                />
              </div>
            </div>
            <div class="work-assignments-form__item__content">
              <div class="work-assignments-form__item__content__hint">
                <noo-textarea
                  v-model="assignment.note"
                  label="Пояснение к работе (необязательно)"
                />
              </div>
              <div class="work-assignments-form__item__content__deadlines">
                <noo-date-input
                  v-model="assignment.solveDeadlineAt"
                  label="Дедлайн сдачи"
                  resettable
                />
                <noo-date-input
                  v-model="assignment.checkDeadlineAt"
                  label="Дедлайн проверки"
                  resettable
                />
              </div>
              <div class="work-assignments-form__item__content__availability">
                <noo-checkbox
                  v-model="assignment.isActive"
                  dimmed
                  size="small"
                >
                  {{
                    assignment.isActive
                      ? 'Работа доступна для решения'
                      : 'Работа неактивна'
                  }}
                </noo-checkbox>
                <noo-if-animation>
                  <noo-date-input
                    v-if="assignment.isActive"
                    v-model="assignment.deactivatedAt"
                    label="Дата деактивации"
                    type="datetime-local"
                    resettable
                  />
                </noo-if-animation>
              </div>
            </div>
          </div>
        </template>
      </noo-draggable-list>
    </div>
    <div class="work-assignments-form__add-action">
      <div class="work-assignments-form__add-action__input">
        <noo-work-select
          v-model="workToAdd"
          label="Выберите работу"
        />
      </div>
      <div class="work-assignments-form__add-action__button">
        <noo-button
          variant="primary"
          :disabled="!workToAdd"
          @click="onAddWorkAssignment"
        >
          Добавить
        </noo-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WorkEntity } from '@/modules/works/api/work.types'
import type { CourseWorkAssignmentEntity } from '@/modules/courses/api/course.types'
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'

const workAssignmentsModel = defineModel<
  PossiblyUnsavedEntity<CourseWorkAssignmentEntity, 'CourseWorkAssignment'>[]
>('work-assignments', { default: () => [] })

const workToAdd = ref<WorkEntity | null>(null)

function onAddWorkAssignment() {
  if (workToAdd.value) {
    workAssignmentsModel.value = [
      ...workAssignmentsModel.value,
      {
        _entityName: 'CourseWorkAssignment',
        _key: `new-${Date.now()}`,
        work: workToAdd.value,
        note: '',
        isActive: true,
        deactivatedAt: null,
        solveDeadlineAt: null,
        checkDeadlineAt: null
      }
    ]
    workToAdd.value = null
  }
}

function onRemoveWorkAssignment(assignmentKey: string) {
  workAssignmentsModel.value = workAssignmentsModel.value.filter(
    (assignment) => assignment._key !== assignmentKey
  )
}
</script>

<style lang="sass" scoped>
.work-assignments-form
  &__item
    padding: 1em
    background-color: var(--light)
    border-radius: var(--border-radius)

    &__head
      display: flex
      align-items: center
      justify-content: space-between
      gap: 1em
      margin-bottom: 1em

      &__remove-button
        cursor: pointer
        padding-right: 0.5em

        &:hover
          --danger: var(--text-light)

    &__content
      &__deadlines, &__availability
        align-items: center
        display: flex
        gap: 1em

        > *
          flex: 1

      &__availability
        margin-top: 0.5em

  &__add-action
    display: flex
    gap: 1em
    justify-content: space-between
    align-items: center
    margin-top: 1em

    &__input
      flex: 1
</style>
