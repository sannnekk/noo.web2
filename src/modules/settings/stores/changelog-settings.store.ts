import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { defineStore } from 'pinia'
import { computed, type ComputedRef } from 'vue'
import { PlatformService } from '../api/platform.service'
import type { ChangelogRelease } from '../api/platform.types'

interface ChangelogSettingsStore {
  /**
   * Releases of the frontend, newest first.
   */
  frontend: UseApiRequestReturn<void, ChangelogRelease[]>
  /**
   * Releases of the API, newest first.
   */
  api: UseApiRequestReturn<void, ChangelogRelease[]>
  /**
   * Version of the newest frontend release, or `null` while it is unknown.
   */
  frontendVersion: ComputedRef<string | null>
  /**
   * Version of the newest API release, or `null` while it is unknown.
   */
  apiVersion: ComputedRef<string | null>
  /**
   * Loads both changelogs. They are independent, so one failing still leaves
   * the other one readable.
   */
  init: () => Promise<void>
}

const useChangelogSettingsStore = defineStore(
  'settings:changelog',
  (): ChangelogSettingsStore => {
    const frontend = useApiRequest<void, ChangelogRelease[]>(() =>
      PlatformService.getFrontendChangelog()
    )

    const api = useApiRequest<void, ChangelogRelease[]>(() =>
      PlatformService.getApiChangelog()
    )

    const frontendVersion = computed(
      () => frontend.data.value?.[0]?.version ?? null
    )

    const apiVersion = computed(() => api.data.value?.[0]?.version ?? null)

    async function init(): Promise<void> {
      await Promise.all([frontend.execute(), api.execute()])
    }

    return {
      frontend,
      api,
      frontendVersion,
      apiVersion,
      init
    }
  }
)

export { useChangelogSettingsStore }
