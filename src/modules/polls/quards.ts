import type { NavigationGuardReturn, RouteLocationNormalized } from "vue-router";

function loadPollGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const pollId = to.params.pollId

  if (!pollId) {
    return { name: 'polls.list' }
  }

  // TODO: Implement actual poll loading logic here

  return true
}

export { loadPollGuard };

