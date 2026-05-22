import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { IPagination } from '@/core/utils/pagination.utils'
import { UserService } from '@/modules/users/api/user.service'
import type { MentorAssignmentEntity } from '@/modules/users/api/user.types'
import { defineStore } from 'pinia'
import { computed, type ComputedRef } from 'vue'

interface ProfileStore {
  /**
   * Mentor assignments of the current user (relevant when the user is a student).
   */
  mentorAssignments: UseApiRequestReturn<
    IPagination | undefined,
    MentorAssignmentEntity[]
  >
  /**
   * Student assignments of the current user (relevant when the user is a mentor).
   */
  studentAssignments: UseApiRequestReturn<
    IPagination | undefined,
    MentorAssignmentEntity[]
  >
  /**
   * Whether the current user is a student.
   */
  isStudent: ComputedRef<boolean>
  /**
   * Whether the current user is a mentor.
   */
  isMentor: ComputedRef<boolean>
  /**
   * Loads the role-relevant assignment list for the current user.
   */
  loadAssignments: () => Promise<void>
}

const useProfileStore = defineStore('profile:profile', (): ProfileStore => {
  const authStore = useAuthStore()
  const uiStore = useGlobalUIStore()

  const isStudent = computed<boolean>(
    () => authStore.userInfo?.role === 'student'
  )
  const isMentor = computed<boolean>(
    () => authStore.userInfo?.role === 'mentor'
  )

  function getCurrentUserId(): string {
    const userId = authStore.userInfo?.id

    if (!userId) {
      throw new Error('No authenticated user in the profile store')
    }

    return userId
  }

  const mentorAssignments = useApiRequest<
    IPagination | undefined,
    MentorAssignmentEntity[]
  >(
    (pagination) =>
      UserService.getMentorAssignments(getCurrentUserId(), pagination),
    undefined,
    (error) =>
      uiStore.createApiErrorToast('Не удалось загрузить кураторов', error)
  )

  const studentAssignments = useApiRequest<
    IPagination | undefined,
    MentorAssignmentEntity[]
  >(
    (pagination) =>
      UserService.getStudentAssignments(getCurrentUserId(), pagination),
    undefined,
    (error) =>
      uiStore.createApiErrorToast('Не удалось загрузить учеников', error)
  )

  async function loadAssignments(): Promise<void> {
    if (isStudent.value) {
      await mentorAssignments.execute(undefined)
    } else if (isMentor.value) {
      await studentAssignments.execute(undefined)
    }
  }

  return {
    mentorAssignments,
    studentAssignments,
    isStudent,
    isMentor,
    loadAssignments
  }
})

export { useProfileStore }
