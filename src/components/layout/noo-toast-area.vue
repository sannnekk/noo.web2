<template>
  <div class="noo-toast-area">
    <noo-list-transition class="noo-toast-area__list">
      <noo-toast
        v-for="toast in globalUiStore.toasts"
        :key="toast.id"
        v-bind="toast"
        @close="globalUiStore.removeToast(toast.id)"
      />
    </noo-list-transition>
  </div>
</template>

<script lang="ts" setup>
import { useGlobalUIStore } from '@/core/stores/global-ui.store'

const globalUiStore = useGlobalUIStore()
</script>

<style lang="sass" scoped>
.noo-toast-area
  position: fixed
  z-index: 99
  width: min(90%, 400px)
  max-height: 90vh
  top: 20px
  right: 20px
  padding: 1em

  &__list
    display: flex
    flex-direction: column
    gap: 0.5em
</style>
