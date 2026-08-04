import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { usePollEditStore } from './stores/poll-edit.store'
import { usePollParticipationStore } from './stores/poll-participation.store'

function loadPollGuard(to: RouteLocationNormalized): NavigationGuardReturn {
  const pollEditStore = usePollEditStore()
  const pollId = to.params.pollId

  pollEditStore.init(pollId as string | undefined)

  return true
}

/**
 * The participation steps are only reachable in order: the questions need a
 * participant, and the thank-you screen needs answers that were actually sent.
 * A visitor who deep-links (or reloads) into a later step starts over.
 */
function participationStartGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const participationStore = usePollParticipationStore()

  if (participationStore.participant) {
    return true
  }

  return {
    name: 'polls.participate.auth',
    params: { pollId: to.params.pollId }
  }
}

function participationResultGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const participationStore = usePollParticipationStore()

  if (participationStore.isSubmitted) {
    return true
  }

  return {
    name: 'polls.participate.auth',
    params: { pollId: to.params.pollId }
  }
}

export { loadPollGuard, participationResultGuard, participationStartGuard }
