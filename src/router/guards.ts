import { useAuthStore } from '@/core/stores/auth.store'
import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'

function isAuthenticatedGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  if (to.meta.noAuth) {
    return true
  }

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return {
      name: 'auth.login',
      query: { redirect: to.fullPath }
    }
  }

  return true
}

function canRoleAccessGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const authStore = useAuthStore()

  if (!to.meta.roles) {
    return true
  }

  if (!authStore.roleIsOneOf(to.meta.roles)) {
    return false
  }

  return true
}

function warnOnLeaveGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): NavigationGuardReturn {
  if (from.meta.warnOnLeave) {
    const confirmLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    )

    if (confirmLeave) {
      return true
    }

    return false
  }

  return true
}

export { canRoleAccessGuard, isAuthenticatedGuard, warnOnLeaveGuard }

