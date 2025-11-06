import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import type { ProfilePageProps } from './pages/profile-page.vue'
import type { ProfilePageTab } from './types'

const module: ApplicationModule = {
  name: 'profile',
  routes: [
    {
      name: 'profile',
      path: '/profile/:tabId?',
      meta: {
        pageTitle: 'Профиль',
        tabTitle: 'Профиль',
        layout: PaneLayout
      },
      component: () => import('./pages/profile-page.vue'),
      props: (route): ProfilePageProps => {
        return {
          tabId: String(route.query.tabId ?? 'info') as ProfilePageTab
        }
      }
    }
  ]
}

export default module
