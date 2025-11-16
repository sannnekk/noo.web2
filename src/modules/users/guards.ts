import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'

function loadUserGuard(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  to: RouteLocationNormalized
): NavigationGuardReturn {
  // TODO: load a user

  return true
}

export { loadUserGuard }
