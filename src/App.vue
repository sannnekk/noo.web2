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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalUIStore } from './core/stores/global-ui.store'
import noLayout from './layouts/no-layout.vue'

const route = useRoute()
const layout = computed(() => route?.meta?.layout ?? noLayout)
const uiStore = useGlobalUIStore()
</script>
