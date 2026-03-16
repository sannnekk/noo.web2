import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import type { NooTubeListPageProps } from './pages/nootube-list-page.vue'
import { NooTubePermissions, nooTubePermissionPolicy } from './permissions'
import type { NooTubeListPageTab } from './types'

const module: ApplicationModule = {
  name: 'nootube',
  routes: [
    {
      name: 'nootube.list',
      path: '/nootube/:tabId?',
      meta: {
        pageTitle: 'НОО.Tube',
        tabTitle: 'НОО.Tube',
        layout: PaneLayout,
        roles: nooTubePermissionPolicy.rolesFor(NooTubePermissions.viewListPage)
      },
      component: () => import('./pages/nootube-list-page.vue'),
      props: (route): NooTubeListPageProps => {
        return {
          tab: String(route.params.tabId ?? 'all') as NooTubeListPageTab
        }
      }
    }
  ]
}

export default module
