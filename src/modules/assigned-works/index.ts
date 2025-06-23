import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import {
  assignedWorkDetailInitGuard,
  assignedWorkListTabGuard,
  assignedWorkModeGuard
} from './guards'
import type { AssignedWorkDetailPageProps } from './pages/assigned-works-detail-page.vue'
import type { AssignedWorkListPageProps } from './pages/assigned-works-list-page.vue'
import type { AssignedWorkListTab, AssignedWorkViewMode } from './types'
import type { AssignedWorksTaskViewProps } from './views/assigned-works-task-view.vue'

const module: ApplicationModule = {
  name: 'assigned-works',
  routes: [
    {
      name: 'assigned-works.list',
      path: '/assigned-works/:tab?',
      meta: {
        pageTitle: 'Мои работы',
        tabTitle: 'Мои работы',
        layout: PaneLayout,
        roles: ['admin', 'teacher', 'assistant', 'mentor', 'student']
      },
      component: () => import('./pages/assigned-works-list-page.vue'),
      beforeEnter: [assignedWorkListTabGuard],
      props: (route): AssignedWorkListPageProps => {
        return {
          tabId:
            route.params.tab.length > 0
              ? (String(route.params.tab) as AssignedWorkListTab)
              : 'all',
          userId: String(route.query.userId)
        }
      }
    },
    {
      name: 'assigned-works.detail',
      path: '/assigned-work/:assignedWorkId/:mode?',
      meta: {
        pageTitle: 'Работа',
        tabTitle: 'Работа',
        warnOnLeave: true,
        layout: PaneLayout,
        roles: ['admin', 'teacher', 'assistant', 'mentor', 'student']
      },
      component: () => import('./pages/assigned-works-detail-page.vue'),
      beforeEnter: [assignedWorkDetailInitGuard, assignedWorkModeGuard],
      props: (route): AssignedWorkDetailPageProps => {
        return {
          mode: String(route.params.mode) as AssignedWorkViewMode,
          assignedWorkId: String(route.params.assignedWorkId)
        }
      },
      children: [
        {
          name: 'assigned-works.detail.comments',
          path: 'comments',
          component: () => import('./views/assigned-works-comments-view.vue')
        },
        {
          name: 'assigned-works.detail.task',
          path: ':taskId',
          component: () => import('./views/assigned-works-task-view.vue'),
          props: (route): AssignedWorksTaskViewProps => {
            return {
              taskId: String(route.params.taskId),
              mode: String(route.params.mode) as AssignedWorkViewMode,
            }
          }
        }
      ]
    }
  ]
}

export default module
