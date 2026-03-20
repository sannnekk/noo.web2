<template>
  <div class="settings-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <settings-menu />
      </template>
      <template #content>
        <router-view />
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import settingsMenu from '../components/settings-menu.vue'

export interface SettingsPageProps {
  tabId?: string
}

defineProps<SettingsPageProps>()
</script>

<style scoped lang="sass"></style>
