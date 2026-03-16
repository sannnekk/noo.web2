<template>
  <div class="course-students-page">
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :is-loading="search.isLoading.value"
      :items="search.data.value"
      :total-count="search.total.value"
    >
      <template #above-content>
        <noo-search-filters v-model:filters="search.filters.value">
          <noo-search-boolean-filter
            v-model:filters="search.filters.value"
            filter-key="isActive"
            label="Активно"
            true-label="Только активные"
            false-label="Только неактивные"
          />
          <noo-search-boolean-filter
            v-model:filters="search.filters.value"
            filter-key="isArchived"
            label="Архив"
            true-label="Только архивные"
            false-label="Только неархивные"
          />
        </noo-search-filters>

        <div class="course-students-page__assign">
          <NooUserSelect
            v-model="studentToAssign"
            class="course-students-page__assign__user"
            label="Добавить ученика"
          />
          <noo-checkbox
            v-model="notifyStudent"
            size="small"
            dimmed
          >
            Уведомить ученика
          </noo-checkbox>
          <noo-button
            variant="primary"
            :is-loading="isAssigning"
            :disabled="!studentToAssign"
            @click="onAssignStudent"
          >
            Добавить в курс
          </noo-button>
        </div>
      </template>

      <template #column-student="{ item }">
        <div class="course-students-page__student-cell">
          <noo-text-block>
            {{ item.student?.name || item.student?.username || item.studentId }}
          </noo-text-block>
          <noo-text-block
            v-if="item.student?.email"
            size="small"
            dimmed
          >
            {{ item.student.email }}
          </noo-text-block>
        </div>
      </template>

      <template #column-type="{ item }">
        <noo-text-block>
          {{ membershipTypeLabels[item.type] }}
        </noo-text-block>
      </template>

      <template #column-isActive="{ item }">
        <noo-text-block :dimmed="!item.isActive">
          {{ item.isActive ? 'Да' : 'Нет' }}
        </noo-text-block>
      </template>

      <template #column-isArchived="{ item }">
        <noo-text-block :dimmed="!item.isArchived">
          {{ item.isArchived ? 'Да' : 'Нет' }}
        </noo-text-block>
      </template>

      <template #column-createdAt="{ item }">
        <noo-date
          :value="item.createdAt"
          include-time
          timezones="both"
        />
      </template>

      <template #column-actions="{ item }">
        <noo-button
          variant="danger-inline"
          size="small"
          :is-loading="deletingMembershipIds.includes(item.id)"
          @click="onRemoveMembership(item)"
        >
          Удалить
        </noo-button>
      </template>
    </noo-search-view>
  </div>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import NooUserSelect from '@/components/inputs/entity-select/noo-user-select.vue'
import { isApiError } from '@/core/api/api.utils'
import { useSearch } from '@/core/composables/useSearch'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { ref } from 'vue'
import type { UserEntity } from '@/modules/users/api/user.types'
import { CourseService } from '../api/course.service'
import type {
  CourseMembershipEntity,
  CourseMembershipType
} from '../api/course.types'

export interface CourseStudentsPageProps {
  courseId: string
}

const props = defineProps<CourseStudentsPageProps>()

const uiStore = useGlobalUIStore()

const studentToAssign = ref<UserEntity | null>(null)
const notifyStudent = ref(true)
const isAssigning = ref(false)
const deletingMembershipIds = ref<string[]>([])

const membershipTypeLabels: Record<CourseMembershipType, string> = {
  'manual-assigned': 'Назначен вручную',
  'external-assigned': 'Назначен внешней системой',
  subscription: 'Подписка'
}

const search = useSearch<CourseMembershipEntity>(CourseService.getMemberships, {
  immediate: true,
  initialFilters: [new EqualsFilter('courseId', props.courseId)]
})

const columns: EntityTableColumnType<CourseMembershipEntity>[] = [
  {
    key: 'student',
    title: 'Ученик'
  },
  {
    key: 'type',
    title: 'Тип назначения'
  },
  {
    key: 'isActive',
    title: 'Активен'
  },
  {
    key: 'isArchived',
    title: 'В архиве'
  },
  {
    key: 'createdAt',
    title: 'Назначен'
  },
  {
    key: 'actions',
    title: '',
    disableLink: true
  }
]

async function onAssignStudent(): Promise<void> {
  if (!studentToAssign.value) {
    return
  }

  isAssigning.value = true

  const response = await CourseService.createMembership({
    studentId: studentToAssign.value.id,
    courseId: props.courseId,
    notifyStudent: notifyStudent.value
  })

  isAssigning.value = false

  if (isApiError(response)) {
    uiStore.createApiErrorToast(
      'Не удалось добавить ученика в курс',
      response.error
    )

    return
  }

  studentToAssign.value = null
  uiStore.createSuccessToast('Ученик добавлен в курс')
  await search.reload()
}

async function onRemoveMembership(
  membership: CourseMembershipEntity
): Promise<void> {
  deletingMembershipIds.value = [...deletingMembershipIds.value, membership.id]

  const response = await CourseService.deleteMembership(membership.id)

  deletingMembershipIds.value = deletingMembershipIds.value.filter(
    (id) => id !== membership.id
  )

  if (isApiError(response)) {
    uiStore.createApiErrorToast(
      'Не удалось удалить ученика из курса',
      response.error
    )

    return
  }

  uiStore.createSuccessToast('Ученик удален из курса')
  await search.reload()
}
</script>

<style scoped lang="sass">
.course-students-page
  padding: 0.5em 0

  &__assign
    display: grid
    grid-template-columns: minmax(260px, 1fr) auto auto
    gap: 1em
    align-items: end
    margin: 0 0.5em 0.5em 0.5em

    &__user
      min-width: 260px

  &__student-cell
    display: flex
    flex-direction: column
    gap: 0.2em
</style>
