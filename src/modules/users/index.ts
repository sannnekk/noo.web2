import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import { loadUserGuard } from './guards'
import type { UsersDetailPageProps } from './pages/users-detail-page.vue'
import { UsersPermissions, usersPermissionPolicy } from './permissions'
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
        roles: usersPermissionPolicy.rolesFor(UsersPermissions.viewListPage)
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
        roles: usersPermissionPolicy.rolesFor(UsersPermissions.viewDetailPage)
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
