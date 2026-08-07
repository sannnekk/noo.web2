import CardsQuizLayout from '@/layouts/cards-quiz-layout.vue'
import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import { TaskCardsPermissions, taskCardsPermissionPolicy } from './permissions'

const module: ApplicationModule = {
  name: 'task-cards',
  routes: [
    {
      name: 'task-cards.list',
      path: '/task-cards',
      meta: {
        pageTitle: 'Карточки с заданиями',
        tabTitle: 'Карточки с заданиями',
        roles: taskCardsPermissionPolicy.rolesFor(
          TaskCardsPermissions.viewListPage
        ),
        layout: PaneLayout
      },
      component: () => import('./pages/task-cards-list-page.vue')
    },
    {
      name: 'task-cards.quiz',
      path: '/task-cards/quiz',
      meta: {
        pageTitle: 'Квиз',
        tabTitle: 'Квиз',
        roles: taskCardsPermissionPolicy.rolesFor(
          TaskCardsPermissions.viewQuizPage
        ),
        layout: CardsQuizLayout
      },
      component: () => import('./pages/task-cards-quiz-page.vue')
    }
  ]
}

export default module
