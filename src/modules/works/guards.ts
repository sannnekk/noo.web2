import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useWorkDetailStore } from './stores/work-detail.store'

async function loadWorkGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const workDetailStore = useWorkDetailStore()
  const workId = String(to.params.workId).trim().length
    ? String(to.params.workId)
    : undefined

  // explicitly without await as we don't want to block navigation
  workDetailStore.init(workId)

  return true
}

export { loadWorkGuard }
