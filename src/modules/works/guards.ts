import { getOptionalRouteParam } from '@/core/utils/route.utils'
import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useWorkDetailStore } from './stores/work-detail.store'

async function loadWorkGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const workDetailStore = useWorkDetailStore()
  const workId = getOptionalRouteParam(to.params.workId)

  // explicitly without await as we don't want to block navigation
  workDetailStore.init(workId)

  return true
}

export { loadWorkGuard }
