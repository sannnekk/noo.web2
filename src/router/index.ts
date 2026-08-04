import ErrorLayout from '@/layouts/error-layout.vue'
import {
  createWebHistory,
  type RouteRecordRaw,
  type RouterOptions
} from 'vue-router'

const routerOptions: RouterOptions = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'root',
      path: '/',
      redirect: { name: 'courses.list' },
      meta: {
        pageTitle: 'Главная',
        tabTitle: 'НОО.Платформа'
      }
    }
  ]
}

/**
 * Catches every address no module claimed. Registered after the modules, so it
 * only ever sees what is left over.
 *
 * It is also where a visitor lands when a page exists but their role is not
 * allowed to open it (see `canRoleAccessGuard`): answering "no such page"
 * rather than "not for you" keeps the platform from mapping itself out for
 * whoever is asking.
 */
const notFoundRoute: RouteRecordRaw = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  meta: {
    pageTitle: 'Страница не найдена',
    tabTitle: 'Страница не найдена',
    layout: ErrorLayout,
    // A wrong address is answered where it was typed, rather than through the
    // login screen.
    noAuth: true
  },
  component: () => import('@/core/pages/not-found-page.vue')
}

export { notFoundRoute, routerOptions }
