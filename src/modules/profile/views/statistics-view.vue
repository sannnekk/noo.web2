<template>
  <statistics-panel
    :user-id="authStore.userInfo?.id ?? null"
    :user-role="authStore.userInfo?.role ?? null"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth.store'
import StatisticsPanel from '@/modules/users/components/statistics-panel.vue'

const authStore = useAuthStore()
</script>
