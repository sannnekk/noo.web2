import type { NavigationGuardReturn, RouteLocationNormalized } from "vue-router";

function loadUserGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  // TODO: load a user

  return true
}

export { loadUserGuard };

