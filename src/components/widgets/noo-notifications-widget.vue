<template>
  <div class="notifications-widget">
    <button
      class="notifications-widget__button"
      title="Уведомления"
      @click="notificationStore.isPaneOpen = true"
    >
      <span
        v-if="notificationStore.unreadCount > 0"
        class="notifications-widget__button__unread-count"
      >
        {{ notificationStore.unreadCountText }}
      </span>
      <noo-icon name="notifications" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/core/stores/notifications.store';

const notificationStore = useNotificationsStore()
</script>

<style scoped lang="sass">
.notifications-widget
  position: relative

  &__button
    text-decoration: none
    color: var(--form-text-color)
    padding: 0.2em
    font-size: 1.6rem
    display: flex
    justify-content: center
    align-items: center
    border-radius: 0.5em
    background-color: transparent
    cursor: pointer
    border: none
    position: relative

    @media screen and (max-width: 768px)
      font-size: 1.4rem
      padding: 0.3em

    &:hover
      background-color: var(--light)

    &__unread-count
      position: absolute
      bottom: 0em
      right: 0em
      display: block
      background-color: var(--danger)
      color: var(--lightest)
      border-radius: 500px
      padding: 0.1em 0.3em
      min-width: 1.2em
      text-align: center
      font-size: 0.4em
      font-weight: bold

      @media screen and (max-width: 768px)
        min-width: 1.3em
</style>
