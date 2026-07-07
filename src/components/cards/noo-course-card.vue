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
        v-if="canManage || canManageOwnMembership"
        class="noo-course-card__img__actions"
        @click.stop.prevent
      >
        <noo-dropdown :actions="actions" />
      </div>
    </div>
    <div
      v-if="course.subject"
      class="noo-course-card__subject"
    >
      <noo-subject-block :subject="course.subject" />
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
  CourseMembershipEntity
} from '@/modules/courses/api/course.types'
import {
  CoursePermissions,
  useCoursePermissions
} from '@/modules/courses/permissions'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  course: CourseEntity
  membership?: CourseMembershipEntity
}

interface Emits {
  (e: 'deleted'): void
  (e: 'membership-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const globalUiStore = useGlobalUIStore()
const { can } = useCoursePermissions()

const canManage = computed(() => can(CoursePermissions.manageCourse))
const canManageOwnMembership = computed(
  () => !!props.membership && can(CoursePermissions.manageOwnMembership)
)

const isPinned = computed(() => props.membership?.isPinnedByStudent ?? false)

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
    if: () => canManageOwnMembership.value,
    onClick: onTogglePin
  },
  {
    label: props.membership?.isArchivedByStudent
      ? 'Вернуть из архива'
      : 'Архивировать',
    icon: 'delete',
    if: () => canManageOwnMembership.value,
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

async function onTogglePin() {
  if (!props.membership) {
    return
  }

  const response = isPinned.value
    ? await CourseService.unpinMembership(props.membership.id)
    : await CourseService.pinMembership(props.membership.id)

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
  emit('membership-updated')
}

async function onToggleArchive() {
  if (!props.membership) {
    return
  }

  const isArchived = props.membership.isArchivedByStudent

  const response = isArchived
    ? await CourseService.unarchiveMembership(props.membership.id)
    : await CourseService.archiveMembership(props.membership.id)

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
  emit('membership-updated')
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
