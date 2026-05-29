<template>
  <div class="mentor-students-list">
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
      <template #column-student="{ item }">
        <noo-inline-user-card :user="item.student" />
      </template>
      <template #column-createdAt="{ item }">
        <noo-date
          :value="item.createdAt"
          include-time
          timezones="both"
        />
      </template>
      <template #column-updatedAt="{ item }">
        <noo-date
          :value="item.updatedAt"
          include-time
          timezones="both"
        />
      </template>
      <template #column-actions="{ item }">
        <div
          v-if="canUnassign(item)"
          class="mentor-students-list__actions"
        >
          <noo-button
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
        pluralize(assignments?.length ?? 0, ['ученик', 'ученика', 'учеников'])
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
  canUnassign?: (assignment: MentorAssignmentEntity) => boolean
  unassignLabel?: string
}

withDefaults(defineProps<Props>(), {
  busyAssignmentId: null,
  canUnassign: () => () => false,
  unassignLabel: 'Снять'
})

const emit = defineEmits<Emits>()

interface Emits {
  (e: 'retry'): void
  (e: 'unassign', assignment: MentorAssignmentEntity): void
}

const columns: EntityTableColumnType<MentorAssignmentEntity>[] = [
  { title: 'Предмет', key: 'subject' },
  { title: 'Ученик', key: 'student' },
  { title: 'Дата присвоения', key: 'createdAt', width: '150px' },
  { title: 'Дата изменения', key: 'updatedAt', width: '150px' },
  { title: '', key: 'actions' }
]
</script>

<style scoped lang="sass">
.mentor-students-list
  &__actions
    display: flex
    gap: 0.25em
    flex-shrink: 0
</style>
