<template>
  <table class="assigned-work-progress">
    <thead class="assigned-work-progress__head">
      <tr>
        <th>Попытка №</th>
        <th>Работа начата</th>
        <th>Статус</th>
        <th>Балл</th>
        <th></th>
      </tr>
    </thead>
    <tbody class="assigned-work-progress__body">
      <tr
        v-for="attempt in progresses"
        :key="attempt.assignedWorkId"
      >
        <td>{{ attempt.attempt }}</td>
        <td>
          <noo-date
            :value="attempt.createdAt"
            include-time
            timezones="local"
          />
        </td>
        <td>
          <noo-solve-status-tag :status="attempt.solveStatus" /><br />
          <noo-check-status-tag :status="attempt.checkStatus" />
        </td>
        <td>
          <noo-assigned-work-score
            :score="attempt.score"
            :max-score="attempt.maxScore"
          />
        </td>
        <td>
          <noo-button
            variant="inline"
            :to="{
              name: 'assigned-works.detail',
              params: {
                assignedWorkId: attempt.assignedWorkId,
                mode: 'view'
              }
            }"
          >
            Перейти
          </noo-button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { type AssignedWorkProgress } from '@/modules/assigned-works/api/assigned-work.types.ts'

interface Props {
  progresses: AssignedWorkProgress[]
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.assigned-work-progress
  width: 100%
  border-collapse: collapse
  font-size: 0.8em

  &__head
    tr
      th
        font-weight: normal
        text-align: left

  &__body
    tr
      td
        font-size: 1em
</style>
