import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import {
  courseListTabAccessGuard,
  initCoursePageGuard,
  initCourseStudentsPageGuard,
  initEditCoursePageGuard
} from './guards'
import type { CourseDetailPageProps } from './pages/course-detail-page.vue'
import type { CourseListPageProps } from './pages/course-list-page.vue'
import type { CourseStudentsPageProps } from './pages/course-students-page.vue'
import type { EditCoursePageProps } from './pages/edit-course-page.vue'
import type { CourseListTab } from './types'
import type { CourseMaterialViewProps } from './views/course-material-content-view.vue'

const module: ApplicationModule = {
  name: 'courses',
  routes: [
    {
      name: 'courses.list',
      path: '/courses/:tabId?',
      meta: {
        pageTitle: 'Курсы',
        tabTitle: 'Курсы',
        layout: PaneLayout,
        roles: ['admin', 'teacher', 'assistant', 'mentor', 'student']
      },
      component: () => import('./pages/course-list-page.vue'),
      beforeEnter: [courseListTabAccessGuard],
      props: (route): CourseListPageProps => {
        return {
          tabId: String(route.params.tabId) as CourseListTab
        }
      }
    },
    {
      name: 'courses.detail',
      path: '/courses/detail/:courseId',
      meta: {
        pageTitle: 'Курс',
        tabTitle: 'Курс',
        layout: PaneLayout,
        roles: ['admin', 'teacher', 'assistant', 'mentor', 'student']
      },
      component: () => import('./pages/course-detail-page.vue'),
      beforeEnter: [initCoursePageGuard],
      props: (route): CourseDetailPageProps => {
        return {
          courseId: String(route.params.courseId)
        }
      },
      children: [
        {
          name: 'courses.detail.material',
          path: 'material/:materialId',
          component: () => import('./views/course-material-content-view.vue'),
          props: (route): CourseMaterialViewProps => {
            return {
              materialId: String(route.params.materialId)
            }
          }
        }
      ]
    },
    {
      name: 'courses.students',
      path: '/courses/students/:courseId',
      meta: {
        pageTitle: 'Ученики курса',
        tabTitle: 'Ученики курса',
        layout: PaneLayout,
        roles: ['admin', 'teacher', /* TODO: remove */ 'student']
      },
      component: () => import('./pages/course-students-page.vue'),
      beforeEnter: [initCourseStudentsPageGuard],
      props: (route): CourseStudentsPageProps => {
        return {
          courseId: String(route.params.courseId)
        }
      }
    },
    {
      name: 'courses.edit',
      path: '/courses/edit/:courseId?',
      meta: {
        pageTitle: 'Редактирование курса',
        tabTitle: 'Редактирование курса',
        layout: PaneLayout
      },
      component: () => import('./pages/edit-course-page.vue'),
      beforeEnter: [initEditCoursePageGuard],
      props: (route): EditCoursePageProps => {
        return {
          courseId: route.params.courseId
            ? String(route.params.courseId)
            : undefined
        }
      }
    }
  ]
}

export default module
