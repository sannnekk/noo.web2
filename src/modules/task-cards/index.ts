import CardsQuizLayout from '@/layouts/cards-quiz-layout.vue'
import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'

const module: ApplicationModule = {
  name: 'task-cards',
  routes: [
    {
      name: 'task-cards.list',
      path: '/task-cards',
      meta: {
        pageTitle: 'Карточки с заданиями',
        tabTitle: 'Карточки с заданиями',
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
        layout: CardsQuizLayout
      },
      component: () => import('./pages/task-cards-quiz-page.vue')
    }
  ]
}

export default module
