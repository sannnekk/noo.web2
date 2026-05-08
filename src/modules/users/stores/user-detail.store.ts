import type { UserRole } from '@/core/api/endpoints/auth.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import { defineStore } from 'pinia'
import { computed, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { UserService } from '../api/user.service'
import type {
  CreateMentorAssignmentPayload,
  MentorAssignmentEntity,
  UserEntity
} from '../api/user.types'

interface UserDetailStore {
  /**
   * The user being viewed.
   */
  user: UseApiRequestReturn<string, UserEntity>
  /**
   * Mentor assignments of the user (relevant when the user is a student).
   */
  mentorAssignments: UseApiRequestReturn<
    IPagination | undefined,
    MentorAssignmentEntity[]
  >
  /**
   * Student assignments of the user (relevant when the user is a mentor).
   */
  studentAssignments: UseApiRequestReturn<
    IPagination | undefined,
    MentorAssignmentEntity[]
  >
  /**
   * Whether the loaded user is a student.
   */
  isStudent: ComputedRef<boolean>
  /**
   * Whether the loaded user is a mentor.
   */
  isMentor: ComputedRef<boolean>
  /**
   * Loads the user and any role-relevant data.
   * Typically called from the route guard.
   */
  init: (userId: string) => Promise<void>
  /**
   * Updates the user using a JSON Patch document.
   */
  update: UseApiRequestReturn<JsonPatchDocument<UserEntity>>
  /**
   * Changes the user's role.
   */
  changeRole: UseApiRequestReturn<UserRole>
  /**
   * Blocks the user.
   */
  block: UseApiRequestReturn
  /**
   * Unblocks the user.
   */
  unblock: UseApiRequestReturn
  /**
   * Manually verifies the user.
   */
  verifyManual: UseApiRequestReturn
  /**
   * Deletes the user and navigates back to the users list.
   */
  deleteUser: UseApiRequestReturn
  /**
   * Assigns a mentor to a student. Refreshes the relevant assignment list
   * for the loaded user (mentor or student side).
   */
  assignMentor: UseApiRequestReturn<
    CreateMentorAssignmentPayload,
    { id: string }
  >
  /**
   * Removes a single mentor assignment by id.
   */
  unassignMentor: UseApiRequestReturn<string>
}

const useUserDetailStore = defineStore(
  'users:user-detail',
  (): UserDetailStore => {
    const uiStore = useGlobalUIStore()
    const router = useRouter()

    const user = useApiRequest(UserService.getById, undefined, (error) =>
      uiStore.createApiErrorToast('Не удалось загрузить пользователя', error)
    )

    const isStudent = computed<boolean>(
      () => user.data.value?.role === 'student'
    )
    const isMentor = computed<boolean>(() => user.data.value?.role === 'mentor')

    function getUserId(): string {
      const userId = user.data.value?.id

      if (!userId) {
        throw new Error('No user is loaded in the user detail store')
      }

      return userId
    }

    const mentorAssignments = useApiRequest<
      IPagination | undefined,
      MentorAssignmentEntity[]
    >(
      (pagination) => UserService.getMentorAssignments(getUserId(), pagination),
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить кураторов', error)
    )

    const studentAssignments = useApiRequest<
      IPagination | undefined,
      MentorAssignmentEntity[]
    >(
      (pagination) =>
        UserService.getStudentAssignments(getUserId(), pagination),
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить учеников', error)
    )

    async function loadAssignmentsForRole(): Promise<void> {
      if (isStudent.value) {
        await mentorAssignments.execute(undefined)
      } else if (isMentor.value) {
        await studentAssignments.execute(undefined)
      }
    }

    async function init(userId: string): Promise<void> {
      await user.execute(userId)

      if (!user.data.value) {
        return
      }

      await loadAssignmentsForRole()
    }

    const update = useApiRequest<JsonPatchDocument<UserEntity>>(
      (patch) => UserService.update(getUserId(), patch),
      async () => {
        uiStore.createSuccessToast('Пользователь успешно обновлён')
        await user.execute(getUserId())
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось обновить пользователя', error)
    )

    const changeRole = useApiRequest<UserRole>(
      (role) => UserService.changeRole(getUserId(), role),
      async () => {
        uiStore.createSuccessToast('Роль пользователя успешно изменена')
        await init(getUserId())
      },
      (error) => uiStore.createApiErrorToast('Не удалось изменить роль', error)
    )

    const block = useApiRequest(
      () => UserService.block(getUserId()),
      async () => {
        uiStore.createSuccessToast('Пользователь заблокирован')
        await user.execute(getUserId())
      },
      (error) =>
        uiStore.createApiErrorToast(
          'Не удалось заблокировать пользователя',
          error
        )
    )

    const unblock = useApiRequest(
      () => UserService.unblock(getUserId()),
      async () => {
        uiStore.createSuccessToast('Пользователь разблокирован')
        await user.execute(getUserId())
      },
      (error) =>
        uiStore.createApiErrorToast(
          'Не удалось разблокировать пользователя',
          error
        )
    )

    const verifyManual = useApiRequest(
      () => UserService.verifyManual(getUserId()),
      async () => {
        uiStore.createSuccessToast('Пользователь подтверждён')
        await user.execute(getUserId())
      },
      (error) =>
        uiStore.createApiErrorToast(
          'Не удалось подтвердить пользователя',
          error
        )
    )

    const deleteUser = useApiRequest(
      () => UserService.delete(getUserId()),
      () => {
        uiStore.createSuccessToast('Пользователь удалён')
        router.push({ name: 'users.list' })
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось удалить пользователя', error)
    )

    const assignMentor = useApiRequest<
      CreateMentorAssignmentPayload,
      { id: string }
    >(
      (payload) => UserService.assignMentor(payload),
      async () => {
        uiStore.createSuccessToast('Куратор назначен')
        await loadAssignmentsForRole()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось назначить куратора', error)
    )

    const unassignMentor = useApiRequest<string>(
      (assignmentId) => UserService.unassignMentor(assignmentId),
      async () => {
        uiStore.createSuccessToast('Куратор снят с ученика')
        await loadAssignmentsForRole()
      },
      (error) => uiStore.createApiErrorToast('Не удалось снять куратора', error)
    )

    return {
      user,
      mentorAssignments,
      studentAssignments,
      isStudent,
      isMentor,
      init,
      update,
      changeRole,
      block,
      unblock,
      verifyManual,
      deleteUser,
      assignMentor,
      unassignMentor
    }
  }
)

export { useUserDetailStore }
