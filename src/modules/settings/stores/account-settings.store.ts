import { AuthService } from '@/core/api/endpoints/auth.service'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { UserService } from '@/modules/users/api/user.service'
import type { UserEntity } from '@/modules/users/api/user.types'
import _ from 'lodash'
import { defineStore } from 'pinia'
import {
  computed,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
  type ShallowRef
} from 'vue'
import { SessionService } from '../api/session.service'
import type { SessionEntity } from '../api/session.types'

interface AccountSettingsStore {
  /**
   * The current authenticated user, fetched from the backend.
   */
  user: UseApiRequestReturn<string, UserEntity>
  /**
   * Editable copy of the user used to compose patch operations.
   * Mutating this draft does not affect the loaded user until `save()` succeeds.
   */
  draft: Ref<UserEntity | null>
  /**
   * Generates JSON Patch operations from the current draft state.
   */
  patchGenerator: ShallowRef<PatchGenerator<UserEntity> | null>
  /**
   * The list of active sessions for the current user.
   */
  sessions: UseApiRequestReturn<void, SessionEntity[]>
  /**
   * Saves the draft using a JSON Patch document.
   */
  save: UseApiRequestReturn
  /**
   * Sends a password reset email to the current user.
   */
  requestPasswordChange: UseApiRequestReturn
  /**
   * Terminates a specific session by ID and refreshes the list.
   */
  terminateSession: UseApiRequestReturn<string>
  /**
   * Terminates every session in the list (effectively logs the user out
   * everywhere, including the current device).
   */
  terminateAllSessions: UseApiRequestReturn
  /**
   * Soft-deletes the current user's account and logs them out.
   */
  deleteAccount: UseApiRequestReturn
  /**
   * Whether the draft has unsaved changes compared to the loaded user.
   */
  hasUnsavedChanges: ComputedRef<boolean>
  /**
   * Loads the current user and the active sessions list.
   */
  init: () => Promise<void>
  /**
   * Reverts the draft to the last loaded user.
   */
  resetDraft: () => void
}

const useAccountSettingsStore = defineStore(
  'settings:account',
  (): AccountSettingsStore => {
    const uiStore = useGlobalUIStore()
    const authStore = useAuthStore()

    const draft = ref<UserEntity | null>(null)
    const patchGenerator = shallowRef<PatchGenerator<UserEntity> | null>(null)
    const changesCount = ref(0)

    function getCurrentUserId(): string {
      const userId = authStore.userInfo?.id

      if (!userId) {
        throw new Error('No authenticated user is available')
      }

      return userId
    }

    function bindDraft(entity: UserEntity): void {
      draft.value = _.cloneDeep(entity)
      patchGenerator.value = JsonPatchUtils.observe(draft.value as UserEntity)
      changesCount.value = 0
    }

    const user = useApiRequest<string, UserEntity>(
      UserService.getById,
      (response) => {
        bindDraft(response.data)
      },
      (error) => {
        uiStore.createApiErrorToast('Не удалось загрузить аккаунт', error)
      }
    )

    const sessions = useApiRequest<void, SessionEntity[]>(
      SessionService.get,
      undefined,
      (error) => {
        uiStore.createApiErrorToast('Не удалось загрузить сессии', error)
      }
    )

    watch(
      draft,
      () => {
        changesCount.value = patchGenerator.value?.countChanges() ?? 0
      },
      { deep: true }
    )

    const hasUnsavedChanges = computed(() => changesCount.value > 0)

    const save = useApiRequest(
      () => {
        if (!patchGenerator.value) {
          return Promise.resolve({ data: undefined })
        }

        return UserService.update(
          getCurrentUserId(),
          patchGenerator.value.generate()
        )
      },
      async () => {
        uiStore.createSuccessToast('Изменения сохранены')
        await user.execute(getCurrentUserId())
      },
      (error) => {
        uiStore.createApiErrorToast('Не удалось сохранить изменения', error)
      }
    )

    const requestPasswordChange = useApiRequest(
      () => {
        const email = authStore.userInfo?.email

        if (!email) {
          throw new Error('Authenticated user has no email')
        }

        return AuthService.forgotPassword(email)
      },
      () => {
        uiStore.createSuccessToast(
          'Письмо отправлено',
          'Проверьте почту для дальнейших инструкций'
        )
      },
      (error) => {
        uiStore.createApiErrorToast(
          'Не удалось отправить письмо для смены пароля',
          error
        )
      }
    )

    const terminateSession = useApiRequest<string>(
      SessionService.delete,
      async () => {
        uiStore.createSuccessToast('Сессия завершена')
        await sessions.execute()
      },
      (error) => {
        uiStore.createApiErrorToast('Не удалось завершить сессию', error)
      }
    )

    const terminateAllSessions = useApiRequest(
      async () => {
        const sessionList = sessions.data.value ?? []
        const failures: string[] = []

        for (const session of sessionList) {
          const response = await SessionService.delete(session.id)

          if ('error' in response) {
            failures.push(session.id)
          }
        }

        if (failures.length > 0) {
          return {
            error: {
              id: 'TERMINATE_ALL_SESSIONS_FAILED',
              statusCode: 0,
              name: 'Не удалось завершить часть сессий',
              description: `Не завершено: ${String(failures.length)}`,
              payload: failures
            }
          }
        }

        return { data: undefined }
      },
      () => {
        uiStore.createSuccessToast('Все сессии завершены')
        authStore.logout.execute()
      },
      (error) => {
        uiStore.createApiErrorToast('Не удалось завершить сессии', error)
      }
    )

    const deleteAccount = useApiRequest(
      () => UserService.delete(getCurrentUserId()),
      () => {
        uiStore.createSuccessToast('Аккаунт удалён')
        authStore.logout.execute()
      },
      (error) => {
        uiStore.createApiErrorToast('Не удалось удалить аккаунт', error)
      }
    )

    async function init(): Promise<void> {
      await Promise.all([user.execute(getCurrentUserId()), sessions.execute()])
    }

    function resetDraft(): void {
      if (!user.data.value) {
        draft.value = null
        patchGenerator.value = null
        changesCount.value = 0

        return
      }

      bindDraft(user.data.value)
    }

    return {
      user,
      draft,
      patchGenerator,
      sessions,
      save,
      requestPasswordChange,
      terminateSession,
      terminateAllSessions,
      deleteAccount,
      hasUnsavedChanges,
      init,
      resetDraft
    }
  }
)

export { useAccountSettingsStore }
