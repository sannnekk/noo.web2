<template>
  <div class="polls-detail-page">
    Polls Detail Page, pollId: {{ pollId }}
  </div>
</template>

<script setup lang="ts">
export interface PollsEditPageProps {
  pollId?: string
}

defineProps<PollsEditPageProps>()
</script>

<style scoped>

</style>
