import type { RouteRecordRaw } from 'vue-router'

export interface ApplicationModule {
  name: string
  routes?: RouteRecordRaw[]
}
