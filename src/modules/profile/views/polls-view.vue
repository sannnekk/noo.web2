<template>
  <div class="polls-view">
    <poll-participations-list :user-id="authStore.userId" />
  </div>
</template>

<script setup lang="ts">
import pollParticipationsList from '@/modules/polls/views/poll-participations-list.vue'
import { useAuthStore } from '@/core/stores/auth.store'

const authStore = useAuthStore()
</script>

<style scoped lang="sass">
.polls-view
  padding-top: 0.5em
</style>
