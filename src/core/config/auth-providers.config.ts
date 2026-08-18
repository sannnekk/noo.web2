import type { IconName } from '@/components/icons/noo-icon.vue'
import type { ExternalAuthProvider } from '../api/endpoints/auth.types'

/**
 * How one external provider looks in the UI. Every surface that draws a
 * provider — the login buttons, the connected-accounts list — reads this, so a
 * new provider is one entry here plus its icon.
 */
export interface AuthProviderDescriptor {
  provider: ExternalAuthProvider
  /** Shown when the server has not named the provider itself. */
  title: string
  icon: IconName
}

const authProviders: AuthProviderDescriptor[] = [
  { provider: 'yandex', title: 'Яндекс ID', icon: 'yandex' },
  { provider: 'vk', title: 'VK ID', icon: 'vk' }
]

const fallbackDescriptor: AuthProviderDescriptor = {
  provider: 'yandex',
  title: 'Вход',
  icon: 'user'
}

/**
 * The descriptor for a provider id. Ids come from the API, so one may name a
 * provider added to the backend after this client shipped.
 */
function describeAuthProvider(
  provider: ExternalAuthProvider
): AuthProviderDescriptor {
  return (
    authProviders.find((descriptor) => descriptor.provider === provider) ??
    fallbackDescriptor
  )
}

export { authProviders, describeAuthProvider }
