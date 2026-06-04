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
        <noo-tabs-layout
          v-model:active-tab="currentTab"
          with-padding
          @tab-change="onTabChange"
        >
          <template #tab-title-unread>
            <span>Непрочитанные</span>
          </template>
          <template #tab-unread>
            <div
              v-if="
                notificationStore.unreadNotifications.isLoading &&
                unreadNotifications.length === 0
              "
              class="noo-notifications-pane__state"
            >
              <noo-loader-icon />
            </div>
            <noo-text-block
              v-else-if="unreadNotifications.length === 0"
              dimmed
              size="small"
              class="noo-notifications-pane__state"
            >
              Нет непрочитанных уведомлений
            </noo-text-block>
            <noo-list-transition
              v-else
              class="noo-notifications-pane__list"
            >
              <noo-notification-item
                v-for="notification in unreadNotifications"
                :key="notification.id"
                :notification="notification"
                @delete="onDelete"
                @navigate="notificationStore.isPaneOpen = false"
              />
            </noo-list-transition>
          </template>
          <template #tab-title-read>
            <span>Прочитанные</span>
          </template>
          <template #tab-read>
            <div
              v-if="
                notificationStore.readNotifications.isLoading &&
                readNotifications.length === 0
              "
              class="noo-notifications-pane__state"
            >
              <noo-loader-icon />
            </div>
            <noo-text-block
              v-else-if="readNotifications.length === 0"
              dimmed
              size="small"
              class="noo-notifications-pane__state"
            >
              Нет прочитанных уведомлений
            </noo-text-block>
            <noo-list-transition
              v-else
              class="noo-notifications-pane__list"
            >
              <noo-notification-item
                v-for="notification in readNotifications"
                :key="notification.id"
                :notification="notification"
                @delete="onDelete"
                @navigate="notificationStore.isPaneOpen = false"
              />
            </noo-list-transition>
          </template>
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
import type { NotificationEntity } from '@/core/api/endpoints/notification.types'
import { useNotificationsStore } from '@/core/stores/notifications.store'
import { computed, shallowRef, watch } from 'vue'

export type NotificationsPaneTab = 'unread' | 'read'

const currentTab = shallowRef<NotificationsPaneTab>('unread')

const notificationStore = useNotificationsStore()

const unreadNotifications = computed<NotificationEntity[]>(
  () => notificationStore.unreadNotifications.data ?? []
)
const readNotifications = computed<NotificationEntity[]>(
  () => notificationStore.readNotifications.data ?? []
)

let readLoaded = false

function onTabChange(tab: string): void {
  if (tab === 'read' && !readLoaded) {
    readLoaded = true
    notificationStore.loadRead()
  }
}

watch(
  () => notificationStore.isPaneOpen,
  (isOpen, wasOpen) => {
    if (isOpen) {
      readLoaded = false
      notificationStore.unreadNotifications.execute()

      return
    }

    if (wasOpen) {
      notificationStore.markAllAsRead.execute()
    }
  }
)

function onDelete(id: string): void {
  notificationStore.deleteNotification.execute(id)
}
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

  &__state
    text-align: center
    padding: 2em 1em

  &__list
    display: flex
    flex-direction: column
    gap: 0.3em
    padding: 0.5em
</style>
