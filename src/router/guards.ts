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

/**
 * The not-found page, shown in place of the address that was asked for. The
 * address bar is left alone — the way a server answers a 404 where it stands,
 * rather than sending the visitor somewhere else.
 */
function toNotFound(to: RouteLocationNormalized): NavigationGuardReturn {
  return {
    name: 'not-found',
    params: { pathMatch: to.path.substring(1).split('/') },
    query: to.query,
    hash: to.hash
  }
}

function canRoleAccessGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const authStore = useAuthStore()

  if (!to.meta.roles) {
    return true
  }

  // A page the visitor's role cannot open is treated as a page that is not
  // there: aborting the navigation would strand them on whatever they were
  // looking at, with nothing to explain why nothing happened.
  if (!authStore.roleIsOneOf(to.meta.roles)) {
    return toNotFound(to)
  }

  return true
}

export { canRoleAccessGuard, isAuthenticatedGuard }
