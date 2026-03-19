<template>
  <div class="work-assignment">
    <div class="work-assignment__head">
      <div class="work-assignment__head__info">
        <noo-work-type-tag :type="workAssignment.work?.type" />
        <noo-title
          :size="4"
          no-margin
        >
          {{ workAssignment.work?.title }}
        </noo-title>
      </div>
      <div class="work-assignment__head__actions">
        <noo-button variant="primary">К работе</noo-button>
      </div>
    </div>
    <div class="work-assignment__body">
      <noo-text-block
        v-if="workAssignment.note"
        dimmed
        size="small"
        no-margin
      >
        {{ workAssignment.note }}
      </noo-text-block>
      <div class="work-assignment__body__deadlines">
        <noo-text-block
          v-if="workAssignment.solveDeadlineAt"
          dimmed
          size="small"
        >
          <noo-icon name="clock" />
          Дедлайн сдачи:
          <noo-date :value="workAssignment.solveDeadlineAt" />
        </noo-text-block>

        <noo-text-block
          v-if="workAssignment.checkDeadlineAt"
          dimmed
          size="small"
        >
          <noo-icon name="clock" />
          Дедлайн проверки:
          <noo-date :value="workAssignment.checkDeadlineAt" />
        </noo-text-block>

        <noo-text-block
          v-if="workAssignment.deactivatedAt"
          dimmed
          size="small"
        >
          <noo-icon name="clock" />
          Работа доступна до:
          <noo-date :value="workAssignment.deactivatedAt" />
        </noo-text-block>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CourseWorkAssignmentEntity } from '../api/course.types.ts'

interface Props {
  workAssignment: CourseWorkAssignmentEntity
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.work-assignment
  padding: 1em
  background-color: var(--light)
  border-radius: var(--border-radius)

  &__head
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 0.5em

    &__info
      max-width: 70%

  &__body
    &__deadlines
      display: flex
      gap: 1em
</style>
