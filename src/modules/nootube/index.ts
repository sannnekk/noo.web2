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
        roles: nooTubePermissionPolicy.rolesFor(NooTubePermissions.viewListTab)
      },
      component: () => import('./pages/nootube-list-page.vue'),
      props: (route): NooTubeListPageProps => {
        return {
          tab: String(route.params.tabId ?? 'all') as NooTubeListPageTab
        }
      }
    },
    {
      name: 'nootube.detail',
      path: '/nootube/video/:videoId',
      meta: {
        pageTitle: 'НОО.Tube',
        tabTitle: 'НОО.Tube',
        layout: PaneLayout,
        roles: nooTubePermissionPolicy.rolesFor(NooTubePermissions.viewListTab)
      },
      component: () => import('./pages/nootube-video-detail-page.vue'),
      props: (route) => ({
        videoId: String(route.params.videoId)
      })
    }
  ]
}

export default module
