<template>
  <div class="noo-course-card">
    <div class="noo-course-card__img">
      <router-link
        class="router-link"
        :to="to"
      >
        <noo-uploaded-image :src="course.thumbnail" />
      </router-link>
      <div
        v-if="isPinned"
        class="noo-course-card__img__pin"
      >
        <noo-icon name="pin" />
      </div>
      <div
        v-if="canManage || canManageOwnState"
        class="noo-course-card__img__actions"
        @click.stop.prevent
      >
        <noo-dropdown :actions="actions" />
      </div>
    </div>
    <div
      v-if="course.subject || isPublic"
      class="noo-course-card__subject"
    >
      <noo-subject-block
        v-if="course.subject"
        :subject="course.subject"
      />
      <span
        v-if="isPublic"
        class="noo-course-card__subject__open"
      >
        Открытый курс
      </span>
    </div>
    <div class="noo-course-card__title">
      <router-link :to="to">
        {{ course.name }}
      </router-link>
    </div>
    <div class="noo-course-card__description">
      {{ course.description }}
    </div>

    <noo-sure-modal
      v-model:is-open="isDeleteOpen"
      @confirm="onConfirmDelete"
    >
      <template #title>
        <noo-title :size="2"> Удалить курс? </noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Курс «{{ course.name }}» будет удалён безвозвратно.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Удалить </template>
    </noo-sure-modal>
  </div>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import { isApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { CourseService } from '@/modules/courses/api/course.service'
import type {
  CourseEntity,
  StudentCourseEntity
} from '@/modules/courses/api/course.types'
import {
  CoursePermissions,
  useCoursePermissions
} from '@/modules/courses/permissions'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  course: CourseEntity
  /** The current student's view of the course. Absent on staff-facing lists. */
  studentCourse?: StudentCourseEntity
}

interface Emits {
  (e: 'deleted'): void
  (e: 'archive-toggled'): void
  (e: 'state-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const globalUiStore = useGlobalUIStore()
const { can } = useCoursePermissions()

const canManage = computed(() => can(CoursePermissions.manageCourse))
const canManageOwnState = computed(
  () => !!props.studentCourse && can(CoursePermissions.manageOwnCourseState)
)

const isPinned = computed(() => props.studentCourse?.isPinned ?? false)
const isPublic = computed(() => props.studentCourse?.accessSource === 'public')

const isDeleteOpen = ref(false)

const actions = computed<DropdownAction[]>(() => [
  {
    label: 'Редактировать',
    icon: 'edit',
    if: () => canManage.value,
    onClick: () =>
      router.push({
        name: 'courses.edit',
        params: { courseId: props.course.id }
      })
  },
  {
    label: 'Участники',
    icon: 'user',
    if: () => canManage.value,
    onClick: () =>
      router.push({
        name: 'courses.students',
        params: { courseId: props.course.id }
      })
  },
  {
    label: props.course.isArchived ? 'Вернуть из архива' : 'Архивировать',
    icon: 'archive',
    if: () => canManage.value,
    onClick: onToggleCourseArchive
  },
  {
    label: 'Удалить',
    icon: 'delete',
    variant: 'danger',
    if: () => canManage.value,
    onClick: () => {
      isDeleteOpen.value = true
    }
  },
  {
    label: isPinned.value ? 'Открепить' : 'Закрепить',
    icon: 'pin',
    if: () => canManageOwnState.value,
    onClick: onTogglePin
  },
  {
    label: props.studentCourse?.isArchived
      ? 'Вернуть из архива'
      : 'Архивировать',
    icon: 'archive',
    if: () => canManageOwnState.value,
    onClick: onToggleArchive
  }
])

const to = computed(() => {
  return {
    name: 'courses.detail',
    params: { courseId: props.course.id }
  }
})

async function onConfirmDelete() {
  const response = await CourseService.delete(props.course.id)

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast('Не удалось удалить курс', response.error)

    return
  }

  globalUiStore.createSuccessToast('Курс удалён')
  emit('deleted')
}

async function onToggleCourseArchive() {
  const isArchived = props.course.isArchived

  const response = isArchived
    ? await CourseService.unarchive(props.course.id)
    : await CourseService.archive(props.course.id)

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      isArchived
        ? 'Не удалось вернуть курс из архива'
        : 'Не удалось архивировать курс',
      response.error
    )

    return
  }

  globalUiStore.createSuccessToast(
    isArchived ? 'Курс возвращён из архива' : 'Курс перемещён в архив'
  )
  emit('archive-toggled')
}

async function onTogglePin() {
  if (!props.studentCourse) {
    return
  }

  const response = await CourseService.patchMyCourseState(props.course.id, [
    { op: 'replace', path: '/isPinned', value: !isPinned.value }
  ])

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      isPinned.value
        ? 'Не удалось открепить курс'
        : 'Не удалось закрепить курс',
      response.error
    )

    return
  }

  globalUiStore.createSuccessToast(
    isPinned.value ? 'Курс откреплён' : 'Курс закреплён'
  )
  emit('state-updated')
}

async function onToggleArchive() {
  if (!props.studentCourse) {
    return
  }

  const isArchived = props.studentCourse.isArchived

  const response = await CourseService.patchMyCourseState(props.course.id, [
    { op: 'replace', path: '/isArchived', value: !isArchived }
  ])

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      isArchived
        ? 'Не удалось вернуть курс из архива'
        : 'Не удалось архивировать курс',
      response.error
    )

    return
  }

  globalUiStore.createSuccessToast(
    isArchived ? 'Курс возвращён из архива' : 'Курс перемещён в архив'
  )
  emit('state-updated')
}
</script>

<style scoped lang="sass">
.noo-course-card
  border-radius: var(--border-radius)
  margin-bottom: 1em
  transition: box-shadow 0.3s ease
  margin-bottom: 2em

  &:hover
    color: var(--lila)

  &__img
    width: 100%
    aspect-ratio: 1.5848
    overflow: hidden
    border-radius: var(--border-radius)
    margin-bottom: 1rem
    position: relative

    &__actions
      position: absolute
      top: 0.4em
      right: 0.4em
      border-radius: var(--border-radius)
      background-color: rgba(0, 0, 0, 0.5)
      color: white

    &__pin
      position: absolute
      top: 0.4em
      left: 0.4em
      display: flex
      align-items: center
      justify-content: center
      padding: 0.35em
      border-radius: var(--border-radius)
      background-color: rgba(0, 0, 0, 0.5)
      color: white

    a
      display: block
      text-decoration: none
      width: 100%
      height: 100%
      overflow: hidden

      img
        width: 100%
        height: 100%
        object-fit: cover
        object-position: center

  &__subject
    display: flex
    flex-direction: row
    align-items: center
    gap: 0.5em
    flex-wrap: wrap

    &__open
      font-size: 0.75em
      padding: 0.15em 0.5em
      border-radius: var(--border-radius)
      white-space: nowrap
      font-weight: bold
      background-color: var(--secondary)
      color: #fff

  &__title
    font-size: 1.2rem
    font-weight: bold
    margin-bottom: 0.5rem

    a
      color: var(--text-dark)
      text-decoration: none

      &:hover
        color: var(--secondary)

  &__description
    margin-bottom: 0.8rem
    color: var(--text-light)
    font-size: 0.9em

  &__author
    display: flex
    flex-direction: row
    align-items: center

    &__avatar
      margin-right: 0.5rem
      font-size: 1.5em

    &__name
      font-size: 0.8rem

      a
        color: var(--text-light)
        text-decoration: none

        &:hover
          color: var(--secondary)

  &__edit
    margin-top: 1rem
    font-size: 0.8rem

    a
      color: var(--text-light)
      text-decoration: none

      &:hover
        color: var(--secondary)
</style>
