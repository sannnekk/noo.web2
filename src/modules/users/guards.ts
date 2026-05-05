import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useUserDetailStore } from './stores/user-detail.store'

async function loadUserGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const userId = String(to.params.userId)
  const userDetailStore = useUserDetailStore()

  userDetailStore.init(userId)

  return true
}

export { loadUserGuard }
