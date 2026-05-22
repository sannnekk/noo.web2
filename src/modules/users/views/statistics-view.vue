<template>
  <statistics-panel
    :user-id="user?.id ?? null"
    :user-role="user?.role ?? null"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import StatisticsPanel from '../components/statistics-panel.vue'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()
const user = computed(() => userDetailStore.user.data)
</script>
