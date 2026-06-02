<template>
  <div class="student-mentors-list">
    <noo-entity-table
      :columns="columns"
      :is-loading="isLoading"
      :data="assignments"
      :error="error"
      :try-again="() => emit('retry')"
    >
      <template #empty>
        <noo-text-block
          dimmed
          no-margin
        >
          {{ emptyText }}
        </noo-text-block>
      </template>
      <template #column-subject="{ item }">
        <noo-subject-block :subject="item.subject ?? null" />
      </template>
      <template #column-mentor="{ item }">
        <noo-inline-user-card :user="item.mentor" />
      </template>
      <template #column-createdAt="{ item }">
        <noo-date
          :value="item.createdAt"
          include-time
          timezones="both"
        />
      </template>
      <template #column-actions="{ item }">
        <div
          v-if="canChange(item) || canUnassign(item)"
          class="student-mentors-list__actions"
        >
          <noo-button
            v-if="canChange(item)"
            variant="inline"
            size="small"
            :disabled="busyAssignmentId === item.id"
            @click="emit('change', item)"
          >
            {{ changeLabel }}
          </noo-button>
          <noo-button
            v-if="canUnassign(item)"
            variant="danger-inline"
            size="small"
            :is-loading="busyAssignmentId === item.id"
            @click="emit('unassign', item)"
          >
            {{ unassignLabel }}
          </noo-button>
        </div>
      </template>
    </noo-entity-table>
    <noo-text-block
      v-if="!isLoading"
      size="small"
      dimmed
      no-margin
    >
      Всего: {{ assignments?.length ?? 0 }}
      {{
        pluralize(assignments?.length ?? 0, [
          'куратор',
          'куратора',
          'кураторов'
        ])
      }}
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import type { ApiError } from '@/core/api/api.utils'
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { pluralize } from '@/core/utils/lang.utils'
import type { MentorAssignmentEntity } from '../api/user.types'

interface Props {
  assignments: MentorAssignmentEntity[]
  isLoading: boolean
  error: ApiError | null
  emptyText: string
  busyAssignmentId?: string | null
  canChange?: (assignment: MentorAssignmentEntity) => boolean
  canUnassign?: (assignment: MentorAssignmentEntity) => boolean
  changeLabel?: string
  unassignLabel?: string
}

withDefaults(defineProps<Props>(), {
  busyAssignmentId: null,
  canChange: () => () => false,
  canUnassign: () => () => false,
  changeLabel: 'Сменить',
  unassignLabel: 'Снять'
})

const emit = defineEmits<Emits>()

interface Emits {
  (e: 'retry'): void
  (e: 'change', assignment: MentorAssignmentEntity): void
  (e: 'unassign', assignment: MentorAssignmentEntity): void
}

const columns: EntityTableColumnType<MentorAssignmentEntity>[] = [
  { title: 'Предмет', key: 'subject' },
  { title: 'Куратор', key: 'mentor' },
  { title: 'Дата присвоения', key: 'createdAt' },
  { title: '', key: 'actions' }
]
</script>

<style scoped lang="sass">
.student-mentors-list
  &__actions
    display: flex
    gap: 0.25em
    flex-shrink: 0
</style>
