import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import { loadPollGuard } from './guards'
import type { PollsEditPageProps } from './pages/polls-edit-page.vue'
import type { PollResultsPageProps } from './pages/poll-results-page.vue'
import type { PollParticipationPageProps } from './pages/poll-participation-page.vue'
import { PollsPermissions, pollsPermissionPolicy } from './permissions'

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
        roles: pollsPermissionPolicy.rolesFor(PollsPermissions.viewListPage)
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
        roles: pollsPermissionPolicy.rolesFor(PollsPermissions.viewEditPage)
      },
      component: () => import('./pages/polls-edit-page.vue'),
      beforeEnter: loadPollGuard,
      props: (route): PollsEditPageProps => {
        return {
          pollId: route.params.pollId ? String(route.params.pollId) : undefined
        }
      }
    },
    {
      name: 'polls.results',
      path: '/polls/:pollId/results',
      meta: {
        pageTitle: 'Результаты опроса',
        tabTitle: 'Результаты опроса',
        layout: PaneLayout,
        roles: pollsPermissionPolicy.rolesFor(PollsPermissions.viewResultsPage)
      },
      component: () => import('./pages/poll-results-page.vue'),
      props: (route): PollResultsPageProps => ({
        pollId: String(route.params.pollId)
      })
    },
    {
      name: 'polls.participation',
      path: '/polls/:pollId/results/:participationId',
      meta: {
        pageTitle: 'Ответы участника',
        tabTitle: 'Ответы участника',
        layout: PaneLayout,
        roles: pollsPermissionPolicy.rolesFor(PollsPermissions.viewResultsPage)
      },
      component: () => import('./pages/poll-participation-page.vue'),
      props: (route): PollParticipationPageProps => ({
        pollId: String(route.params.pollId),
        participationId: String(route.params.participationId)
      })
    }
  ]
}

export default module
