import type { ApplicationModule } from '@/types/ApplicationModule'
import PaneLayout from '@/layouts/pane-layout.vue'
import { CalendarPermissions, calendarPermissionPolicy } from './permissions'

const module: ApplicationModule = {
  name: 'calendar',
  routes: [
    {
      name: 'calendar',
      path: '/calendar',
      meta: {
        pageTitle: 'Календарь',
        tabTitle: 'Календарь',
        layout: PaneLayout,
        roles: calendarPermissionPolicy.rolesFor(CalendarPermissions.viewPage)
      },
      component: () => import('./pages/calendar-page.vue')
    }
  ]
}

export default module
