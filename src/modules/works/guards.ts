import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useWorkDetailStore } from './stores/work-detail.store'

async function loadWorkGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const workDetailStore = useWorkDetailStore()
  const workId = to.params.workId as string | undefined

  workDetailStore.init(workId)

  return true
}

export { loadWorkGuard }
