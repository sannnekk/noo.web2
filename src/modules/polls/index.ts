import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import { loadPollGuard } from './guards'
import type { PollsEditPageProps } from './pages/polls-edit-page.vue'

const module: ApplicationModule = {
  name: 'polls',
  routes: [
    {
      name: 'polls.list',
      path: '/polls',
      meta: {
        pageTitle: 'Опросы',
        tabTitle: 'Опросы',
        layout: PaneLayout,
        roles: ['admin', 'teacher', /* TODO: remove */ 'student']
      },
      component: () => import('./pages/polls-list-page.vue')
    },
    {
      name: 'polls.edit',
      path: '/polls/edit/:pollId?',
      meta: {
        pageTitle: 'Редактировать опрос',
        tabTitle: 'Редактировать опрос',
        warnOnLeave: true,
        layout: PaneLayout,
        roles: ['admin', 'teacher', /* TODO: remove */ 'student']
      },
      component: () => import('./pages/polls-edit-page.vue'),
      beforeEnter: loadPollGuard,
      props: (route): PollsEditPageProps => {
        return {
          pollId:
            route.params.pollId.length > 0
              ? String(route.params.pollId)
              : undefined
        }
      }
    }
  ]
}

export default module
