<template>
  <div class="profile-page">
    <noo-sidebar-layout>
      <template #sidebar> Ыщьу ышвуифк </template>
      <template #content>
        <noo-tabs-layout
          use-route-tabs
          route-param-name="tabId"
        >
          <template #tab-title-info>
            <span>Общая информация</span>
          </template>
          <template #tab-info>
            <span>Info</span>
          </template>
          <template #tab-title-statistics>
            <span>Статистика</span>
          </template>
          <template #tab-statistics>
            <span>123</span>
          </template>
        </noo-tabs-layout>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import type { ProfilePageTab } from '../types'

export interface ProfilePageProps {
  tabId?: ProfilePageTab
}

defineProps<ProfilePageProps>()
</script>

<style scoped></style>
