<template>
  <button class="noo-logout-button">
    <span
      class="noo-logout-button__text"
      @click.prevent="authStore.logout.execute()"
    >
      Выйти
    </span>
  </button>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/core/stores/auth.store'

const authStore = useAuthStore()
</script>

<style scoped lang="sass">
.noo-logout-button
  border: none
  background: none
  color: var(--danger)
  cursor: pointer
  font-size: 1em

  &__icon
    margin-right: 0.4em

  &:hover
    opacity: 0.7
</style>
