<template>
  <div class="users-list-page">
    users detail page
  </div>
</template>

<script setup lang="ts">
import type { UserDetailTab } from '../types';

export interface UsersDetailPageProps {
  tabId: UserDetailTab
  userId: string
}

defineProps<UsersDetailPageProps>()
</script>

<style scoped lang="sass">

</style>
