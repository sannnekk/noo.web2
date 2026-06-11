import { defineStore } from 'pinia'
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../api/endpoints/auth.service'
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  UserRole
} from '../api/endpoints/auth.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '../composables/useApiRequest'
import { GlobalEventBus } from '../events/event-bus'
import { CookieStorage } from '../utils/cookies.utils'
import { useGlobalUIStore } from './global-ui.store'
import { UserService } from '@/modules/users/api/user.service'
import type { UserEntity } from '@/modules/users/api/user.types'

export interface AuthStore {
  /**
   * ID of the authenticated user. Restored synchronously from cookies on boot
   * so route guards and permission checks work before `currentUser` resolves.
   */
  userId: ShallowRef<string | undefined>
  /**
   * Role of the authenticated user. Like {@link userId}, kept as a lightweight,
   * cookie-backed value so role-based guards don't have to await the full fetch.
   */
  userRole: ShallowRef<UserRole | undefined>
  /**
   * The full, up-to-date authenticated user, fetched from the server on login
   * and on every page load while authenticated.
   */
  currentUser: UseApiRequestReturn<void, UserEntity>
  loadCurrentUser: () => Promise<void>
  isAuthenticated: ComputedRef<boolean>
  isRetryLoginModalVisible: ShallowRef<boolean>
  setRedirect: (value?: string) => void
  login: UseApiRequestReturn<LoginPayload, LoginResponse>
  retryLogin: UseApiRequestReturn<LoginPayload, LoginResponse>
  register: UseApiRequestReturn<RegisterPayload>
  forgotPassword: UseApiRequestReturn<string>
  verifyEmail: UseApiRequestReturn<string>
  resetPassword: UseApiRequestReturn<ResetPasswordPayload>
  logout: UseApiRequestReturn
  roleIsOneOf: (roles: UserRole[]) => boolean
}

const useAuthStore = defineStore('global:auth', (): AuthStore => {
  const globalUiStore = useGlobalUIStore()

  // state
  const userId = shallowRef<string>()
  const userRole = shallowRef<UserRole>()
  const isAuthenticated = computed(() => !!userId.value)
  const router = useRouter()
  const isRetryLoginModalVisible = shallowRef<boolean>(false)
  const redirect = shallowRef<string>()

  // setters
  function setRedirect(value?: string): void {
    redirect.value = value
  }

  function setSession(response: LoginResponse): void {
    userId.value = response.userId
    userRole.value = response.userRole

    CookieStorage.set(CookieStorage.StorageAliases.userId, response.userId)
    CookieStorage.set(CookieStorage.StorageAliases.userRole, response.userRole)
    CookieStorage.set(
      CookieStorage.StorageAliases.apiToken,
      response.accessToken
    )
  }

  // getters
  function roleIsOneOf(roles: UserRole[]): boolean {
    if (!userRole.value) {
      return false
    }

    return roles.includes(userRole.value)
  }

  // current user
  const currentUser = useApiRequest<void, UserEntity>(
    () => UserService.getById(userId.value!),
    undefined,
    (error) => {
      globalUiStore.createApiErrorToast(
        'Не удалось загрузить данные пользователя',
        error
      )
    }
  )

  // Fetches the full, up-to-date current user from the server. Triggered on
  // login and on every app/page load while authenticated, so the lightweight
  // identity restored from cookies is always backed by fresh server data.
  async function loadCurrentUser(): Promise<void> {
    if (!userId.value) {
      return
    }

    await currentUser.execute()
  }

  // requests
  const login = useApiRequest<LoginPayload, LoginResponse>(
    AuthService.login,
    (response) => {
      setSession(response.data)

      if (redirect.value) {
        router.push(redirect.value)
      } else {
        router.push({ name: 'root' })
      }
    },
    (error) => {
      globalUiStore.createApiErrorToast('Не удалось войти', error)
    }
  )

  const retryLogin = useApiRequest<LoginPayload, LoginResponse>(
    AuthService.login,
    (response) => {
      setSession(response.data)
      isRetryLoginModalVisible.value = false
      globalUiStore.createSuccessToast('Вы снова в системе')
    }
  )

  function clearSession(): void {
    globalUiStore.setLoading(false)
    userId.value = undefined
    userRole.value = undefined
    currentUser.data.value = null
    isRetryLoginModalVisible.value = false
    CookieStorage.clear()
    router.push({ name: 'auth.login' })
  }

  const logout = useApiRequest(
    () => {
      globalUiStore.setLoading(true)

      return AuthService.removeCurrentSession()
    },
    clearSession,
    clearSession
  )

  const register = useApiRequest<RegisterPayload>(
    AuthService.register,
    () => {
      globalUiStore.createSuccessToast('Вы успешно зарегистрировались')
      router.push({ name: 'auth.login' })
    },
    (error) => {
      globalUiStore.createErrorToast('Ошибка при регистрации', error.name)
    }
  )

  const forgotPassword = useApiRequest<string>(
    AuthService.forgotPassword,
    () => {
      globalUiStore.createSuccessToast(
        'Пароль успешно сброшен',
        'Проверьте почту для получения дальнейших инструкций'
      )
      router.push({ name: 'auth.login' })
    },
    (error) => {
      globalUiStore.createErrorToast('Ошибка при сбросе пароля', error.name)
    }
  )

  const verifyEmail = useApiRequest<string>(
    AuthService.verifyEmail,
    () => {
      globalUiStore.createSuccessToast(
        'Почта успешно подтверждена',
        'Теперь вы можете войти в систему'
      )
      router.push({ name: 'auth.login' })
    },
    (error) => {
      globalUiStore.createErrorToast(
        'Ошибка при подтверждении почты',
        error.name
      )
    }
  )

  const resetPassword = useApiRequest<ResetPasswordPayload>(
    AuthService.resetPassword,
    () => {
      globalUiStore.createSuccessToast(
        'Пароль успешно изменен',
        'Теперь вы можете войти в систему'
      )
      router.push({ name: 'auth.login' })
    },
    (error) => {
      globalUiStore.createErrorToast('Ошибка при изменении пароля', error.name)
    }
  )

  // set initial state from cookies
  userId.value = CookieStorage.get<string>(CookieStorage.StorageAliases.userId)
  userRole.value = CookieStorage.get<UserRole>(
    CookieStorage.StorageAliases.userRole
  )

  // event listeners
  GlobalEventBus.on('auth:logout', logout.execute)
  GlobalEventBus.on('auth:login-expired', () => {
    isRetryLoginModalVisible.value = true
  })

  return {
    userId,
    userRole,
    currentUser,
    loadCurrentUser,
    isAuthenticated,
    isRetryLoginModalVisible,
    roleIsOneOf,
    setRedirect,
    login,
    retryLogin,
    register,
    forgotPassword,
    verifyEmail,
    resetPassword,
    logout
  }
})

export { useAuthStore }
