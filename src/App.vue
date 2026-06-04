<template>
  <div class="app">
    <noo-layout-change-transition>
      <component :is="layout">
        <router-view />
      </component>
    </noo-layout-change-transition>
    <noo-loader-overlay
      v-if="uiStore.isLoading"
      :loading-progress="0"
    />
  </div>
  <noo-toast-area />
  <retry-login-modal />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import RetryLoginModal from './core/components/retry-login-modal.vue'
import { useNotificationsPolling } from './core/composables/useNotificationsPolling'
import { useTheme } from './core/composables/useTheme'
import { useAuthStore } from './core/stores/auth.store'
import { useGlobalUIStore } from './core/stores/global-ui.store'
import { usePersonalizationSettingsStore } from './core/stores/personalization-settings.store'
import noLayout from './layouts/no-layout.vue'

const route = useRoute()
const layout = computed(() => route?.meta?.layout ?? noLayout)
const uiStore = useGlobalUIStore()
const authStore = useAuthStore()
const settingsStore = usePersonalizationSettingsStore()
const { setTheme } = useTheme()

useNotificationsPolling()

watch(() => settingsStore.settings.data?.theme, setTheme, { immediate: true })

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      settingsStore.init()
    }
  },
  { immediate: true }
)
</script>
