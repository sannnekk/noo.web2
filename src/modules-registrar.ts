import type { ApplicationModule } from '@/types/ApplicationModule'
import { createRouter, type RouteRecordRaw } from 'vue-router'
import { routerOptions } from './router'
import { canRoleAccessGuard, isAuthenticatedGuard } from './router/guards'
import {
  setPageTitleMiddleware,
  setTabTitleMiddleware
} from './router/middlewares'

function registerModules(modules: ApplicationModule[]): {
  router: ReturnType<typeof createRouter>
} {
  // eslint-disable-next-line no-console
  console.info(`⚙️  Registering modules, environment: ${import.meta.env.MODE}`)

  const options = routerOptions

  for (const module of modules) {
    const { name, routes } = module

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`ℹ️  Registered module: ${name}`)
    }

    if (routes) {
      ;(options.routes as RouteRecordRaw[]).push(...routes)
    }
  }

  const router = createRouter(options)

  router.beforeEach(isAuthenticatedGuard)
  router.beforeEach(canRoleAccessGuard)
  router.afterEach(setTabTitleMiddleware)
  router.afterEach(setPageTitleMiddleware)

  return { router }
}

export { registerModules }

