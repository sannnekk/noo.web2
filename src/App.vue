<template>
  <div class="app">
    <noo-layout-change-transition>
      <component :is="layout">
        <router-view />
      </component>
    </noo-layout-change-transition>
    <noo-loader-overlay
      v-if="uiStore.isLoading"
      :loading-progress="uiStore.loadingProgress ?? 0"
      :text="uiStore.loadingText"
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
import { useAuthStore } from './core/stores/auth.store'
import { useGlobalUIStore } from './core/stores/global-ui.store'
import { usePersonalizationSettingsStore } from './core/stores/personalization-settings.store'
import { usePlatformSettingsStore } from './core/stores/platform-settings.store'
import noLayout from './layouts/no-layout.vue'

const route = useRoute()
const layout = computed(() => route?.meta?.layout ?? noLayout)
const uiStore = useGlobalUIStore()
const authStore = useAuthStore()
const settingsStore = usePersonalizationSettingsStore()
const platformSettingsStore = usePlatformSettingsStore()

useNotificationsPolling()

// Not gated on the session: the footer, the auth pages and the whole help
// section are built from these links and are shown before anyone signs in.
platformSettingsStore.load()

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      authStore.loadCurrentUser()
      settingsStore.init()
    }
  },
  { immediate: true }
)
</script>
