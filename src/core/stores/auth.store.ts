import { defineStore } from 'pinia'
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../api/endpoints/auth.service'
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  UserInfo,
  UserRole
} from '../api/endpoints/auth.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '../composables/useApiRequest'
import { GlobalEventBus } from '../events/event-bus'
import { CookieStorage } from '../utils/cookies.utils'
import { useGlobalUIStore } from './global-ui.store'

export interface AuthStore {
  userInfo: ShallowRef<UserInfo | undefined>
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
  const userInfo = shallowRef<UserInfo>()
  const isAuthenticated = computed(() => !!userInfo.value)
  const router = useRouter()
  const isRetryLoginModalVisible = shallowRef<boolean>(false)
  const redirect = shallowRef<string>()

  // setters
  function setRedirect(value?: string): void {
    redirect.value = value
  }

  // getters
  function roleIsOneOf(roles: UserRole[]): boolean {
    if (!userInfo.value) {return false}

    return roles.includes(userInfo.value.role)
  }

  // requests
  const login = useApiRequest<LoginPayload, LoginResponse>(
    AuthService.login,
    (response) => {
      userInfo.value = response.data.userInfo

      CookieStorage.set(CookieStorage.StorageAliases.user, userInfo.value)
      CookieStorage.set(
        CookieStorage.StorageAliases.apiToken,
        response.data.accessToken
      )

      if (redirect.value) {
        router.push(redirect.value)
      } else {
        router.push({ name: 'root' })
      }
    },
    (error) => { globalUiStore.createApiErrorToast('Не удалось войти', error); }
  )

  const retryLogin = useApiRequest<LoginPayload, LoginResponse>(
    AuthService.login,
    (response) => {
      userInfo.value = response.data.userInfo
      isRetryLoginModalVisible.value = false

      CookieStorage.set(CookieStorage.StorageAliases.user, userInfo.value)
      globalUiStore.createSuccessToast('Вы снова в системе')
    }
  )

  const logout = useApiRequest(
    () => {
      globalUiStore.setLoading(true)

      return AuthService.removeCurrentSession()
    },
    () => {
      globalUiStore.setLoading(false)
      userInfo.value = undefined
      CookieStorage.clear()
      router.push({ name: 'auth.login' })
    },
    () => {
      globalUiStore.setLoading(false)
      userInfo.value = undefined
      CookieStorage.clear()
      router.push({ name: 'auth.login' })
    }
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
  userInfo.value = CookieStorage.get<UserInfo>(
    CookieStorage.StorageAliases.user
  )

  // event listeners
  GlobalEventBus.on('auth:logout', logout.execute)
  GlobalEventBus.on('auth:login-expired', () => {
    isRetryLoginModalVisible.value = true
  })

  return {
    userInfo,
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
