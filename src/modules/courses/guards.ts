import { useAuthStore } from '@/core/stores/auth.store'
import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { CoursePermissions, coursePermissionPolicy } from './permissions'
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

  if (tabId === 'own' || tabId === 'archived') {
    const permission =
      tabId === 'own'
        ? CoursePermissions.viewOwnTab
        : CoursePermissions.viewArchivedTab

    if (!coursePermissionPolicy.can(permission, authStore.userInfo?.role)) {
      return { name: 'courses.list', params: { tabId: 'all' } }
    }
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
  initEditCoursePageGuard
}
