import { createWebHistory, type RouterOptions } from 'vue-router'

const routerOptions: RouterOptions = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'root',
      path: '/',
      redirect: { name: 'assigned-works.list' },
      meta: {
        pageTitle: 'Главная',
        tabTitle: 'НОО.Платформа'
      }
    }
  ]
}

export { routerOptions }
