import { AuthService } from '@/core/api/endpoints/auth.service'
import type {
  ExternalAuthProvider,
  LinkedIdentity
} from '@/core/api/endpoints/auth.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useAuthStore } from '@/core/stores/auth.store'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'

/** Where the provider callback sends the browser once a link is finished. */
const returnUrl = '/settings/connected-accounts'

interface ConnectedAccountsSettingsStore {
  /**
   * The providers already attached to the current account.
   */
  list: UseApiRequestReturn<void, LinkedIdentity[]>
  /**
   * Detaches a provider. Refused by the server when it is the only way in.
   */
  unlink: UseApiRequestReturn<ExternalAuthProvider>
  /**
   * Sends the browser to the provider to attach it. Navigates away on success.
   */
  link: (provider: ExternalAuthProvider) => Promise<void>
  init: () => Promise<void>
}

const useConnectedAccountsSettingsStore = defineStore(
  'settings:connected-accounts',
  (): ConnectedAccountsSettingsStore => {
    const uiStore = useGlobalUIStore()
    const authStore = useAuthStore()

    const list = useApiRequest<void, LinkedIdentity[]>(
      AuthService.getLinkedIdentities,
      undefined,
      (error) =>
        uiStore.createApiErrorToast(
          'Не удалось загрузить привязанные аккаунты',
          error
        )
    )

    const unlink = useApiRequest<ExternalAuthProvider>(
      AuthService.unlinkIdentity,
      async () => {
        uiStore.createSuccessToast('Аккаунт отвязан')
        await list.execute()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось отвязать аккаунт', error)
    )

    async function link(provider: ExternalAuthProvider): Promise<void> {
      await authStore.startExternalLink.execute({ provider, returnUrl })
    }

    async function init(): Promise<void> {
      await Promise.all([list.execute(), authStore.loadExternalProviders()])
    }

    return { list, unlink, link, init }
  }
)

export { useConnectedAccountsSettingsStore }
