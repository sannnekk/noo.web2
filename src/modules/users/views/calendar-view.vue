<template>
  <div class="calendar-view">
    <noo-calendar-view :user-id="userId" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  userId: string
}

defineProps<Props>()
</script>

<style scoped lang="sass"></style>
