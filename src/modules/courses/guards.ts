import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { courseListTabs } from './course-list-tabs'
import { coursePermissionPolicy } from './permissions'
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

function defaultCourseListTab(): CourseListTab {
  const fallback = courseListTabs.find((tab) =>
    coursePermissionPolicy.can(tab.permission)
  )

  return fallback?.id ?? 'all'
}

function courseListTabAccessGuard(
  to: RouteLocationNormalized
): NavigationGuardReturn {
  const tabId = to.params.tabId as CourseListTab
  const hasAccess = courseListTabs.some(
    (tab) => tab.id === tabId && coursePermissionPolicy.can(tab.permission)
  )

  if (hasAccess) {
    return true
  }

  return { name: 'courses.list', params: { tabId: defaultCourseListTab() } }
}

export {
  courseListTabAccessGuard,
  initCoursePageGuard,
  initEditCoursePageGuard
}
