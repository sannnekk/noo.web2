<template>
  <div
    class="noo-notifications-pane"
    :class="{
      'noo-notifications-pane--is-open': notificationStore.isPaneOpen
    }"
  >
    <div class="noo-notifications-pane__inner">
      <div class="noo-notifications-pane__header">
        <noo-title
          :size="2"
          class="noo-notifications-pane__header__title"
        >
          Уведомления
        </noo-title>
      </div>
      <div class="noo-notifications-pane__body">
        <noo-tabs-layout v-model:active-tab="currentTab">
          <template #tab-title-unread>
            <span>Непрочитанные</span>
          </template>
          <template #tab-unread> Read... </template>
          <template #tab-title-read>
            <span>Прочитанные</span>
          </template>
          <template #tab-read> Unread... </template>
        </noo-tabs-layout>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-if="notificationStore.isPaneOpen"
      class="noo-notifications-pane__overlay"
      @click="notificationStore.isPaneOpen = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/core/stores/notifications.store'
import { shallowRef } from 'vue'

export type NotificationsPaneTab = 'unread' | 'read'

const currentTab = shallowRef<NotificationsPaneTab>('unread')

const notificationStore = useNotificationsStore()

/* const readNotifications = computed<NotificationEntity[]>(
  () => notificationStore.readNotifications.data ?? []
)
const unreadNotifications = computed<NotificationEntity[]>(
  () => notificationStore.unreadNotifications.data ?? []
)

const readNotificationsDatedList = useDatedList<NotificationEntity>({
  list: readNotifications,
  getDate: (item) => item.createdAt
})

const unreadNotificationsDatedList = useDatedList<NotificationEntity>({
  list: unreadNotifications,
  getDate: (item) => item.createdAt
}) */
</script>

<style scoped lang="sass">
.noo-notifications-pane
  position: fixed
  right: -350px
  top: 0
  z-index: 999999
  width: min(90%, 350px)
  height: 100%
  background-color: var(--lightest)
  transition: right 0.3s ease-in-out
  overflow-y: auto

  &--is-open
    right: 0

  &__overlay
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    background-color: #00000088
    z-index: 999998
    cursor: pointer

  &__inner
    display: flex
    flex-direction: column
    height: 100%

  &__header
    &__title
      padding: 2em 0.5em 0.75em 0.5em
      margin: 0

  &__list
    padding: 0.5em
</style>
