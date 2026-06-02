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

        <noo-inline-link
          v-if="workAssignment.work && can(CoursePermissions.manageCourse)"
          :to="{
            name: 'works.edit',
            params: { workId: workAssignment.work?.id }
          }"
          new-tab
          size="small"
        >
          Перейти к работе
        </noo-inline-link>
      </div>
      <div
        v-if="can(CoursePermissions.solveWork)"
        class="work-assignment__head__actions"
      >
        <noo-button
          variant="primary"
          :disabled="!workAssignment.isActive || isLoading || isError"
          :is-loading="isLoading"
          @click="toWorkClick()"
        >
          К работе
        </noo-button>
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

        <noo-text-block
          v-if="!workAssignment.isActive"
          dimmed
          size="small"
        >
          <noo-icon name="cross-red" />
          Работа недоступна для выполнения
        </noo-text-block>
      </div>
      <div class="work-assignment__body__progress">
        <div
          v-if="isLoading"
          class="work-assignment__body__progress__loading"
        >
          <noo-input-skeleton />
        </div>
        <div
          v-else-if="progresses.length > 0"
          class="work-assignment__body__progress__loaded"
        >
          <noo-collapsable-block variant="inline">
            <template #collapsed>
              <noo-text-block
                dimmed
                size="small"
              >
                Прогресс по работе
              </noo-text-block>
            </template>
            <template #visible>
              <assigned-work-progress :progresses="progresses" />
            </template>
          </noo-collapsable-block>
        </div>
        <div
          v-else-if="!isError"
          class="work-assignment__body__progress__empty"
        >
          <noo-text-block
            dimmed
            size="small"
          >
            Работа еще не начата
          </noo-text-block>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import assignedWorkProgress from './assigned-work-progress.vue'
import type { AssignedWorkProgress } from '@/modules/assigned-works/api/assigned-work.types.ts'
import type { CourseWorkAssignmentEntity } from '../api/course.types.ts'
import { CoursePermissions, useCoursePermissions } from '../permissions.ts'
import { onMounted, shallowRef } from 'vue'
import { AssignedWorkService } from '@/modules/assigned-works/api/assigned-work.service.ts'
import { isApiError } from '@/core/api/api.utils.ts'
import { useGlobalUIStore } from '@/core/stores/global-ui.store.ts'
import { useRouter } from 'vue-router'
import type { AssignedWorkViewMode } from '@/modules/assigned-works/types.ts'
import { getLastAttempt } from '../utils.ts'

interface Props {
  workAssignment: CourseWorkAssignmentEntity
}

const props = defineProps<Props>()

const { can } = useCoursePermissions()
const globalUiStore = useGlobalUIStore()
const router = useRouter()

const progresses = shallowRef<AssignedWorkProgress[]>([])
const isLoading = shallowRef(false)
const isError = shallowRef(false)

onMounted(async () => {
  const response = await AssignedWorkService.getProgress(
    props.workAssignment.id
  )

  if (isApiError(response)) {
    isError.value = true

    return
  }

  // TODO: fix api client to not show here possible null so that ! is not needed,
  // because logically it can't be null here (after error check), maybe just an empty list []
  progresses.value = response.data!
  isLoading.value = false
})

async function toWorkClick() {
  if (isLoading.value || isError.value) {
    return
  }

  let assignedWorkId: string, mode: AssignedWorkViewMode
  const lastAttempt = getLastAttempt(progresses.value)

  if (lastAttempt) {
    assignedWorkId = lastAttempt.assignedWorkId
    mode = lastAttempt.solveStatus == 'solved' ? 'read' : 'solve'
  } else {
    isLoading.value = true
    const response = await AssignedWorkService.create(props.workAssignment.id)

    if (isApiError(response)) {
      isError.value = true

      globalUiStore.createApiErrorToast(
        'Не удалось перейти к работе',
        response.error
      )

      return
    }

    // TODO: fix api client to not show here possible null so that ! is not needed,
    // because logically it can't be null here (after error check)
    assignedWorkId = response.data!.id
    mode = 'solve'
  }

  isLoading.value = false

  router.push({
    name: 'assigned-works.detail',
    params: {
      mode,
      assignedWorkId
    }
  })
}
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
