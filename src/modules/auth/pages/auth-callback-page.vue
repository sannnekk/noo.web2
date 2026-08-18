<template>
  <div class="auth-callback-page">
    <noo-error-block v-if="authStore.completeExternalAuth.error">
      {{ authStore.completeExternalAuth.error.description }}
      <template #actions>
        <noo-button
          variant="secondary"
          :to="{ name: 'auth.login' }"
        >
          Вернуться ко входу
        </noo-button>
      </template>
    </noo-error-block>
    <template v-else>
      <noo-loader-icon contrast />
      <noo-text-block
        align="center"
        size="medium"
      >
        Завершаем вход через {{ describeAuthProvider(provider).title }}...
      </noo-text-block>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ExternalAuthProvider } from '@/core/api/endpoints/auth.types'
import { describeAuthProvider } from '@/core/config/auth-providers.config'
import { useAuthStore } from '@/core/stores/auth.store'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  provider: ExternalAuthProvider
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const route = useRoute()

// The whole query string is forwarded untouched: which parameters matter is the
// provider's business (VK sends a device_id that Yandex does not).
onMounted(() =>
  authStore.completeExternalAuth.execute({
    provider: props.provider,
    parameters: Object.fromEntries(
      Object.entries(route.query)
        .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
        .filter(([, value]) => typeof value === 'string')
    ) as Record<string, string>
  })
)
</script>

<style scoped lang="sass">
.auth-callback-page
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 1em
  min-height: 100dvh
  padding: 1em

  font-size: 2em
</style>
