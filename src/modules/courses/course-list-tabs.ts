import { defineAsyncComponent, type Component } from 'vue'
import type { CoursePermission } from './permissions'
import { CoursePermissions } from './permissions'
import type { CourseListTab } from './types'

/**
 * A single tab of the course list page.
 */
interface CourseListTabDefinition {
  /**
   * Tab identifier, used as the `tabId` route param.
   */
  id: CourseListTab
  /**
   * Tab title shown to the user.
   */
  title: string
  /**
   * Permission required to see the tab. Tabs sharing the same id must
   * have permissions with disjoint role sets, so that any given user
   * sees at most one tab per id.
   */
  permission: CoursePermission
  /**
   * View component rendered inside the tab.
   */
  component: Component
  /**
   * Props passed to the view component.
   */
  props?: Record<string, unknown>
}

// The views are loaded lazily to keep them out of the eagerly loaded
// router setup chunk (this config is imported by the route guards).
const CoursesView = defineAsyncComponent(
  () => import('./views/courses-view.vue')
)
const CourseMembershipsView = defineAsyncComponent(
  () => import('./views/course-memberships-view.vue')
)

/**
 * All tabs of the course list page in display order. The first tab
 * the current user is permitted to see is the default one.
 */
const courseListTabs: readonly CourseListTabDefinition[] = [
  {
    id: 'all',
    title: 'Все курсы',
    permission: CoursePermissions.viewAllCoursesTab,
    component: CoursesView
  },
  {
    id: 'all',
    title: 'Все курсы',
    permission: CoursePermissions.viewOwnMembershipsTab,
    component: CourseMembershipsView
  },
  {
    id: 'own',
    title: 'Мои курсы',
    permission: CoursePermissions.viewOwnCoursesTab,
    component: CoursesView,
    props: { ownOnly: true }
  },
  {
    id: 'archived',
    title: 'Архив',
    permission: CoursePermissions.viewArchivedCoursesTab,
    component: CoursesView,
    props: { archived: true }
  },
  {
    id: 'archived',
    title: 'Архив',
    permission: CoursePermissions.viewArchivedMembershipsTab,
    component: CourseMembershipsView,
    props: { archived: true }
  }
]

export type { CourseListTabDefinition }
export { courseListTabs }
