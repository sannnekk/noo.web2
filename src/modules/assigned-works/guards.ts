import { useAuthStore } from '@/core/stores/auth.store'
import { unref } from 'vue'
import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useAssignedWorkDetailStore } from './stores/assigned-work-detail.store'
import type { AssignedWorkViewMode } from './types'

async function assignedWorkDetailInitGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const assignedWorkStore = useAssignedWorkDetailStore()

  const assignedWorkId = to.params.assignedWorkId as string

  if (!assignedWorkId) {
    return false
  }

  await assignedWorkStore.init(assignedWorkId)

  return true
}

function assignedWorkModeGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const authStore = useAuthStore()
  const assignedWorkStore = useAssignedWorkDetailStore()

  const assignedWorkId = String(to.params.assignedWorkId)
  const mode = String(to.params.mode) as AssignedWorkViewMode
  const possibleModes: AssignedWorkViewMode[] = ['read', 'solve', 'check']

  if (!assignedWorkStore.assignedWork?.work) {
    return true // still allow navigation to show the error
  }

  const { solveStatus, checkStatus } = unref(assignedWorkStore.assignedWork)

  // if not student or mentor, redirect to read mode
  if (
    authStore.userInfo?.role !== 'student' &&
    authStore.userInfo?.role !== 'mentor'
  ) {
    return mode === 'read'
      ? true
      : {
          name: 'assigned-works.detail',
          params: { assignedWorkId, mode: 'read' }
        }
  }

  // bad value for mode, redirect to read mode
  if (!possibleModes.includes(mode)) {
    return {
      name: 'assigned-works.detail',
      params: { assignedWorkId, mode: 'read' }
    }
  }

  // if student, make sure the work is not made yet, otherwise redirect to read mode
  if (authStore.userInfo.role === 'student') {
    if (solveStatus === 'solved' && mode !== 'read') {
      return {
        name: 'assigned-works.detail',
        params: { assignedWorkId, mode: 'read' }
      }
    }

    if (mode === 'check') {
      return {
        name: 'assigned-works.detail',
        params: { assignedWorkId, mode: 'read' }
      }
    }

    return true
  }

  // is mentor
  // make sure the work is not checked yet and already solved, otherwise redirect to read mode
  if (
      (checkStatus === 'checked' || solveStatus !== 'solved') &&
      mode !== 'read'
    ) {
      return {
        name: 'assigned-works.detail',
        params: { assignedWorkId, mode: 'read' }
      }
    }

    return true
}

function assignedWorkListTabGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const tab = to.params.tab as string
  const validTabs = ['all', 'my', 'solved', 'checked']

  // if tab is not valid, redirect to all tab
  if (!validTabs.includes(tab)) {
    return {
      name: 'assigned-works.list',
      params: { tab: 'all' }
    }
  }

  return true
}

export {
  assignedWorkDetailInitGuard, assignedWorkListTabGuard, assignedWorkModeGuard
}

