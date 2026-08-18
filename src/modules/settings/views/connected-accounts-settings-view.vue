<template>
  <div class="connected-accounts-settings-view">
    <noo-section
      title="Привязанные аккаунты"
      description="Привязав аккаунт стороннего сервиса, Вы сможете входить на платформу одним нажатием, без пароля. Платформа получит только имя, почту и аватар — ничего больше."
    >
      <div
        v-if="isInitialLoading"
        class="connected-accounts-settings-view__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <noo-error-block
        v-else-if="loadError"
        no-margin
        :try-again="() => store.init()"
      >
        Не удалось загрузить привязанные аккаунты.
      </noo-error-block>
      <noo-card-stack
        v-else-if="providers.length"
        :cols="1"
      >
        <div
          v-for="provider in providers"
          :key="provider.provider"
          class="connected-accounts-settings-view__account"
        >
          <div class="connected-accounts-settings-view__account__icon">
            <noo-icon :name="describeAuthProvider(provider.provider).icon" />
          </div>
          <div class="connected-accounts-settings-view__account__info">
            <noo-title
              :size="5"
              no-margin
            >
              {{ provider.displayName }}
            </noo-title>
            <noo-text-block
              size="small"
              dimmed
              no-margin
            >
              <template v-if="provider.identity">
                {{
                  provider.identity.email ??
                  provider.identity.displayName ??
                  'Привязан'
                }}
              </template>
              <template v-else>Не привязан</template>
            </noo-text-block>
          </div>
          <noo-button
            v-if="provider.identity"
            size="small"
            variant="danger-inline"
            :is-loading="
              store.unlink.isLoading && pendingUnlink === provider.provider
            "
            @click="askUnlink(provider.provider)"
          >
            Отвязать
          </noo-button>
          <noo-button
            v-else
            size="small"
            variant="secondary"
            :is-loading="authStore.startExternalLink.isLoading"
            @click="store.link(provider.provider)"
          >
            Привязать
          </noo-button>
        </div>
      </noo-card-stack>
      <noo-text-block
        v-else
        dimmed
      >
        Вход через сторонние сервисы сейчас недоступен.
      </noo-text-block>
    </noo-section>
  </div>

  <noo-sure-modal
    v-model:is-open="isUnlinkOpen"
    @confirm="confirmUnlink"
    @cancel="pendingUnlink = null"
  >
    <template #title>
      <noo-title :size="2">Отвязать аккаунт?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Вы больше не сможете входить на платформу через этот сервис. Привязать
        его снова можно в любой момент.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Отвязать</template>
  </noo-sure-modal>
</template>

<script lang="ts" setup>
import type { ExternalAuthProvider } from '@/core/api/endpoints/auth.types'
import { describeAuthProvider } from '@/core/config/auth-providers.config'
import { useAuthStore } from '@/core/stores/auth.store'
import { computed, onMounted, shallowRef } from 'vue'
import { useConnectedAccountsSettingsStore } from '../stores/connected-accounts-settings.store'

const store = useConnectedAccountsSettingsStore()
const authStore = useAuthStore()

const pendingUnlink = shallowRef<ExternalAuthProvider | null>(null)
const isUnlinkOpen = computed({
  get: () => pendingUnlink.value !== null,
  set: (value) => {
    if (!value) {
      pendingUnlink.value = null
    }
  }
})

// Every provider this deployment offers, whether or not it is attached yet —
// the list is what the user connects from, not just what they already have.
const providers = computed(() =>
  (authStore.externalProviders.data ?? []).map((provider) => ({
    ...provider,
    identity:
      store.list.data?.find(
        (identity) => identity.provider === provider.provider
      ) ?? null
  }))
)

const isInitialLoading = computed(
  () => store.list.isLoading && !store.list.data
)

const loadError = computed(() => !store.list.data && !!store.list.error)

function askUnlink(provider: ExternalAuthProvider): void {
  pendingUnlink.value = provider
}

function confirmUnlink(): void {
  if (pendingUnlink.value) {
    store.unlink.execute(pendingUnlink.value)
    pendingUnlink.value = null
  }
}

onMounted(store.init)
</script>

<style scoped lang="sass">
.connected-accounts-settings-view
  &__loading
    display: flex
    justify-content: center
    padding: 1em
    font-size: 2em

  &__account
    display: flex
    align-items: center
    gap: 1em
    padding: 1em
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)

    &__icon
      font-size: 2em
      display: flex
      align-items: center

    &__info
      flex: 1
      min-width: 0
</style>
