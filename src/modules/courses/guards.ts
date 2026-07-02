import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import type { CoursePermission } from './permissions'
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

const courseTabPermissions: Record<CourseListTab, CoursePermission> = {
  all: CoursePermissions.viewAllTab,
  own: CoursePermissions.viewOwnTab,
  archived: CoursePermissions.viewArchivedTab
}

function defaultCourseListTab(): CourseListTab {
  const fallback = (['all', 'own', 'archived'] as CourseListTab[]).find((tab) =>
    coursePermissionPolicy.can(courseTabPermissions[tab])
  )

  return fallback ?? 'all'
}

function courseListTabAccessGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const tabId = to.params.tabId as CourseListTab
  const permission = courseTabPermissions[tabId]

  if (permission && coursePermissionPolicy.can(permission)) {
    return true
  }

  return { name: 'courses.list', params: { tabId: defaultCourseListTab() } }
}

export {
  courseListTabAccessGuard,
  initCoursePageGuard,
  initEditCoursePageGuard
}
