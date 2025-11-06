<template>
  <div class="settings-page">
    <noo-sidebar-layout>
      <template #sidebar> Sidebar </template>
      <template #content> Content </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
export interface SettingsPageProps {
  tabId?: string
}

defineProps<SettingsPageProps>()
</script>

<style scoped lang="sass"></style>
