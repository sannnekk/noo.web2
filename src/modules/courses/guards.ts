import { useAuthStore } from '@/core/stores/auth.store'
import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useCourseDetailStore } from './stores/course-detail.store'
import { useCourseEditStore } from './stores/course-edit.store'
import type { CourseListTab } from './types'

async function initCoursePageGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const courseId = String(to.params.courseId)
  const courseDetailStore = useCourseDetailStore()

  courseDetailStore.course.execute(courseId)

  return true
}

async function initCourseStudentsPageGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const courseId = to.params.courseId

  // TODO: fetch students for the course

  return true
}

async function initEditCoursePageGuard(
  to: RouteLocationNormalized
): Promise<NavigationGuardReturn> {
  const courseId = to.params.courseId ? String(to.params.courseId) : undefined
  const courseDetailStore = useCourseEditStore()

  courseDetailStore.init(courseId)

  return true
}

function courseListTabAccessGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const tabId = to.params.tabId as string
  const authStore = useAuthStore()

  // only teachers and students can access own and archived tabs, for others only all
  switch (tabId) {
    case 'own':
    case 'archived':
      if (!authStore.roleIsOneOf(['teacher', 'student'])) {
        return { name: 'courses.list', params: { tabId: 'all' } }
      }
      break
    case 'all':
    default:
      break
  }

  // Check if the tabId is valid
  const validTabs: CourseListTab[] = ['all', 'own', 'archived']

  if (validTabs.includes(tabId as CourseListTab)) {
    return true
  }

  // If the tabId is invalid, redirect to the 'all' tab
  return { name: 'courses.list', params: { tabId: 'all' } }
}

export {
  courseListTabAccessGuard,
  initCoursePageGuard,
  initCourseStudentsPageGuard,
  initEditCoursePageGuard
}
