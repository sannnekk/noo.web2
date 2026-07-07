<template>
  <div class="course-students-page">
    <div class="course-students-page__head">
      <div class="course-students-page__head__image">
        <noo-uploaded-image :src="course?.thumbnail" />
      </div>
      <div class="course-students-page__head__info">
        <noo-back-button
          :route="{
            name: 'courses.detail',
            params: { courseId: props.courseId }
          }"
        >
          Назад к курсу
        </noo-back-button>
        <noo-subject-block :subject="course?.subject ?? null" />
        <noo-title
          :size="3"
          no-margin
        >
          {{ course?.name }}
        </noo-title>
        <noo-text-block
          dimmed
          size="small"
        >
          Количество учеников на курсе: {{ search.total.value }}
        </noo-text-block>
      </div>
    </div>
    <div class="course-students-page__assign">
      <noo-grid-layout
        :cols="12"
        gap="1em"
      >
        <noo-grid-layout-item
          :col="1"
          :row="1"
          :colspan="6"
          vertical-align="center"
          horizontal-align="stretch"
        >
          <noo-user-select
            v-model="studentToAssign"
            class="course-students-page__assign__user"
            label="Добавить ученика"
          />
        </noo-grid-layout-item>
        <noo-grid-layout-item
          :col="7"
          :row="1"
          :colspan="3"
          vertical-align="center"
          horizontal-align="stretch"
        >
          <noo-checkbox
            v-model="notifyStudent"
            size="small"
            dimmed
          >
            Уведомить ученика
          </noo-checkbox>
        </noo-grid-layout-item>
        <noo-grid-layout-item
          :col="9"
          :row="1"
          :colspan="3"
          vertical-align="center"
          horizontal-align="right"
        >
          <noo-button
            variant="primary"
            :is-loading="isAssigning"
            :disabled="!studentToAssign"
            @click="onAssignStudent"
          >
            Добавить на курс
          </noo-button>
        </noo-grid-layout-item>
      </noo-grid-layout>
    </div>
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :is-loading="search.isLoading.value"
      :items="search.data.value"
      :total-count="search.total.value"
      :error="search.error.value"
      :try-again="search.reload"
    >
      <template #above-content>
        <noo-search-filters v-model:filters="search.filters.value">
          <noo-search-boolean-filter
            v-model:filters="search.filters.value"
            filter-key="isActive"
            label="Активность"
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
      </template>

      <template #column-student="{ item }">
        <div class="course-students-page__student-cell">
          <noo-inline-user-card :user="item.student" />
          <noo-text-block
            v-if="item.student?.email"
            size="small"
            dimmed
            no-margin
          >
            {{ item.student.email }}
          </noo-text-block>
        </div>
      </template>

      <template #column-type="{ item }">
        <noo-text-block>
          {{ membershipTypeLabel(item.type) }}
        </noo-text-block>
      </template>

      <template #column-isActive="{ item }">
        <noo-active-tag :active="item.isActive" />
      </template>

      <template #column-isArchived="{ item }">
        <noo-text-block :dimmed="!item.isArchived">
          {{ item.isArchived ? 'Да' : 'Нет' }}
        </noo-text-block>
      </template>

      <template #column-assignedAt="{ item }">
        <noo-date
          :value="item.createdAt"
          include-time
          timezones="both"
          multiline
        />
      </template>

      <template #column-assigner="{ item }">
        <noo-inline-user-card :user="item.assigner" />
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
import { ref, computed, watch } from 'vue'
import type { UserEntity } from '@/modules/users/api/user.types'
import { CourseService } from '../api/course.service'
import type {
  CourseMembershipEntity,
  CourseMembershipType
} from '../api/course.types'
import { courseMembershipTypes } from '../constants'
import { useApiRequest } from '@/core/composables/useApiRequest'

export interface CourseStudentsPageProps {
  courseId: string
}

const props = defineProps<CourseStudentsPageProps>()

const uiStore = useGlobalUIStore()

const studentToAssign = ref<UserEntity | null>(null)
const notifyStudent = ref(true)
const isAssigning = ref(false)
const deletingMembershipIds = ref<string[]>([])

function membershipTypeLabel(type: CourseMembershipType): string {
  return (
    courseMembershipTypes.find((entry) => entry.value === type)?.label ?? type
  )
}

const search = useSearch<CourseMembershipEntity>(CourseService.getMemberships, {
  immediate: true,
  initialFilters: [new EqualsFilter('courseId', props.courseId)]
})

const courseRequest = useApiRequest(() => CourseService.getById(props.courseId))
const course = computed(() => courseRequest.data.value)

watch(
  () => props.courseId,
  () => courseRequest.execute(),
  { immediate: true }
)

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
    key: 'assignedAt',
    title: 'Назначен'
  },
  {
    key: 'assigner',
    title: 'Назначил(a)'
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

  &__head
    padding: 0 0.5em
    display: flex
    gap: 1em

    &__image
      height: 10em
      aspect-ratio: 1.5848
      border-radius: var(--border-radius)
      overflow: hidden

      img
        width: 100%
        height: 100%
        object-fit: cover
        object-position: center

  &__assign
    margin: 1em 0.5em
    border-radius: var(--border-radius)
    padding: 0 0.3em
    background-color: var(--light)

    &__user
      min-width: 260px

  &__student-cell
    display: flex
    flex-direction: column
    gap: 0.2em
</style>
