import HelpLayout from '@/layouts/help-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import type { SupportCategory } from './api/support.types'

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
      name: 'help.articles',
      path: '/help/:category',
      meta: {
        pageTitle: 'НОО - Помощь',
        tabTitle: 'НОО - Помощь',
        layout: HelpLayout,
        noAuth: true
      },
      component: () => import('./pages/help-articles-page.vue'),
      props: (route) => ({
        category: String(route.params.category ?? 'courses') as SupportCategory
      }),
      children: [
        {
          name: 'help.articles.detail',
          path: ':articleSlug',
          meta: {
            pageTitle: 'НОО - Помощь',
            tabTitle: 'НОО - Помощь',
            layout: HelpLayout,
            noAuth: true
          },
          component: () => import('./pages/help-article-detail-page.vue'),
          props: (route) => ({ articleSlug: String(route.params.articleSlug) })
        }
      ]
    }
  ]
}

export default module
