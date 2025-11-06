import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import type { SettingsPageProps } from './pages/settings-page.vue'
import type { SettingsPageTab } from './types'

const module: ApplicationModule = {
  name: 'settings',
  routes: [
    {
      name: 'settings',
      path: '/settings/:tabId?',
      meta: {
        pageTitle: 'Настройки',
        tabTitle: 'Настройки',
        layout: PaneLayout
      },
      component: () => import('./pages/settings-page.vue'),
      props: (route): SettingsPageProps => {
        return {
          tabId: String(route.query.tabId ?? 'account') as SettingsPageTab
        }
      }
    }
  ]
}

export default module
