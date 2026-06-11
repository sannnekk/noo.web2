<template>
  <statistics-panel
    :user-id="authStore.userId ?? null"
    :user-role="authStore.userRole ?? null"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth.store'
import StatisticsPanel from '@/modules/users/components/statistics-panel.vue'

const authStore = useAuthStore()
</script>
