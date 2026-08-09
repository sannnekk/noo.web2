import PaneLayout from '@/layouts/pane-layout.vue'
import PollLayout from '@/layouts/poll-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import {
  loadPollGuard,
  participationResultGuard,
  participationStartGuard
} from './guards'
import type { PollsEditPageProps } from './pages/polls-edit-page.vue'
import type { PollResultsPageProps } from './pages/poll-results-page.vue'
import type { PollParticipationPageProps } from './pages/poll-participation-page.vue'
import type { PollParticipationDetailsPageProps } from './pages/poll-participation-details-page.vue'
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
      name: 'polls.participate',
      path: '/polls/participate/:pollId',
      meta: {
        pageTitle: 'Принять участие в опросе',
        tabTitle: 'Принять участие в опросе',
        layout: PollLayout,
        noAuth: true
      },
      component: () => import('./pages/poll-participation-page.vue'),
      props: (route): PollParticipationPageProps => ({
        pollId: String(route.params.pollId)
      }),
      redirect: (to) => ({
        name: 'polls.participate.auth',
        params: { pollId: to.params.pollId }
      }),
      children: [
        {
          name: 'polls.participate.auth',
          path: 'auth',
          component: () => import('./views/poll-participation-auth-view.vue')
        },
        {
          name: 'polls.participate.questions',
          path: 'questions',
          beforeEnter: participationStartGuard,
          component: () =>
            import('./views/poll-participation-questions-view.vue')
        },
        {
          name: 'polls.participate.success',
          path: 'success',
          meta: {
            pageTitle: 'Спасибо за участие',
            tabTitle: 'Спасибо за участие'
          },
          beforeEnter: participationResultGuard,
          component: () => import('./views/poll-participation-success-view.vue')
        }
      ]
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
      component: () => import('./pages/poll-participation-details-page.vue'),
      props: (route): PollParticipationDetailsPageProps => ({
        pollId: String(route.params.pollId),
        participationId: String(route.params.participationId)
      })
    }
  ]
}

export default module
