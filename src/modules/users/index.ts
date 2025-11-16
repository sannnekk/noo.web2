import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import { loadUserGuard } from './guards'
import type { UsersDetailPageProps } from './pages/users-detail-page.vue'
import type { UserDetailTab } from './types'

const module: ApplicationModule = {
  name: 'users',
  routes: [
    {
      name: 'users.list',
      path: '/users',
      meta: {
        pageTitle: 'Пользователи',
        tabTitle: 'Пользователи',
        layout: PaneLayout,
        roles: [
          'admin',
          'teacher',
          'assistant',
          'mentor',
          /* TODO: remove */ 'student'
        ]
      },
      component: () => import('./pages/users-list-page.vue')
    },
    {
      name: 'users.detail',
      path: '/users/:userId/:tabId?',
      meta: {
        pageTitle: 'Пользователь',
        tabTitle: 'Пользователь',
        warnOnLeave: true,
        layout: PaneLayout,
        roles: [
          'admin',
          'teacher',
          'assistant',
          'mentor',
          /* TODO: remove */ 'student'
        ]
      },
      component: () => import('./pages/users-detail-page.vue'),
      beforeEnter: loadUserGuard,
      props: (route): UsersDetailPageProps => {
        return {
          userId: String(route.params.userId),
          tabId: String(route.params.tabId ?? 'info') as UserDetailTab
        }
      }
    }
  ]
}

export default module
