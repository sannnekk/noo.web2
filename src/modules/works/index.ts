import { getOptionalRouteParam } from '@/core/utils/route.utils'
import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import { loadWorkGuard } from './guards'
import { WorksPermissions, worksPermissionPolicy } from './permissions'
import type { WorksDetailPageProps } from './pages/works-detail-page.vue'

const module: ApplicationModule = {
  name: 'works',
  routes: [
    {
      name: 'works.list',
      path: '/works',
      meta: {
        pageTitle: 'Работы',
        tabTitle: 'Работы',
        layout: PaneLayout,
        roles: worksPermissionPolicy.rolesFor(WorksPermissions.viewListPage)
      },
      component: () => import('./pages/works-list-page.vue')
    },
    {
      name: 'works.edit',
      path: '/works/edit/:workId?',
      meta: {
        pageTitle: 'Работа',
        tabTitle: 'Работа',
        warnOnLeave: true,
        layout: PaneLayout,
        roles: worksPermissionPolicy.rolesFor(WorksPermissions.viewEditPage)
      },
      component: () => import('./pages/works-detail-page.vue'),
      beforeEnter: loadWorkGuard,
      props: (route): WorksDetailPageProps => {
        return {
          workId: getOptionalRouteParam(route.params.workId)
        }
      }
    }
  ]
}

export default module
