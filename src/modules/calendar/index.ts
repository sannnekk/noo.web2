import type { ApplicationModule } from '@/types/ApplicationModule'
import PaneLayout from '@/layouts/pane-layout.vue'
import { useAuthStore } from '@/core/stores/auth.store'
import { CalendarPermissions, calendarPermissionPolicy } from './permissions'

const module: ApplicationModule = {
  name: 'calendar',
  routes: [
    {
      name: 'calendar',
      path: '/calendar/:userId?',
      meta: {
        pageTitle: 'Календарь',
        tabTitle: 'Календарь',
        layout: PaneLayout,
        roles: calendarPermissionPolicy.rolesFor(CalendarPermissions.viewPage)
      },
      component: () => import('./pages/calendar-page.vue'),
      props: (route) => {
        const authStore = useAuthStore()

        return {
          userId: route.params.userId
            ? String(route.params.userId)
            : authStore.userInfo?.id
        }
      }
    }
  ]
}

export default module
