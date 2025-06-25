import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { usePollEditStore } from './stores/poll-edit.store'

function loadPollGuard(to: RouteLocationNormalized): NavigationGuardReturn {
  const pollEditStore = usePollEditStore()
  const pollId = to.params.pollId

  pollEditStore.init(pollId as string | undefined)

  return true
}

export { loadPollGuard }
