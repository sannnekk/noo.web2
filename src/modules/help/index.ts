import HelpLayout from '@/layouts/help-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'

const module: ApplicationModule = {
  name: 'help',
  routes: [
    {
      name: 'help.home',
      path: '/help',
      meta: {
        pageTitle: 'НОО - Помощь и поддержка',
        tabTitle: 'НОО - Помощь и поддержка',
        layout: HelpLayout,
        noAuth: true
      },
      component: () => import('./pages/help-home-page.vue')
    },
    {
      name: 'help.courses',
      path: '/help/courses',
      meta: {
        pageTitle: 'НОО - Помощь по курсам',
        tabTitle: 'НОО - Помощь по курсам',
        layout: HelpLayout,
        noAuth: true
      },
      component: () => import('./pages/help-courses-page.vue')
    },
    {
      name: 'help.payment',
      path: '/help/payment',
      meta: {
        pageTitle: 'НОО - Помощь по оплате',
        tabTitle: 'НОО - Помощь по оплате',
        layout: HelpLayout,
        noAuth: true
      },
      component: () => import('./pages/help-payment-page.vue')
    },
    {
      name: 'help.works',
      path: '/help/works',
      meta: {
        pageTitle: 'НОО - Помощь по работам',
        tabTitle: 'НОО - Помощь по работам',
        layout: HelpLayout,
        noAuth: true
      },
      component: () => import('./pages/help-works-page.vue')
    }
  ]
}

export default module
