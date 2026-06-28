<template>
  <div class="polls-view">
    <poll-participations-list :user-id="userId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import pollParticipationsList from '@/modules/polls/views/poll-participations-list.vue'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()

const userId = computed(() => userDetailStore.user.data?.id)
</script>

<style scoped lang="sass">
.polls-view
  padding-top: 0.5em
</style>
