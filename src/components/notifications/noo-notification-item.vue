<template>
  <div
    class="noo-notification-item"
    :class="{ 'noo-notification-item--unread': !notification.isRead }"
  >
    <div class="noo-notification-item__icon">
      <noo-icon :name="icon" />
    </div>
    <div class="noo-notification-item__content">
      <div class="noo-notification-item__content__head">
        <noo-title
          :size="4"
          class="noo-notification-item__content__head__title"
        >
          {{ notification.title }}
        </noo-title>
        <span
          class="noo-notification-item__content__head__close"
          title="Удалить уведомление"
          @click="$emit('delete', notification.id)"
        >
          <noo-icon name="close" />
        </span>
      </div>
      <noo-text-block
        v-if="notification.message"
        class="noo-notification-item__content__text"
        dimmed
        size="small"
      >
        {{ notification.message }}
      </noo-text-block>
      <div class="noo-notification-item__content__footer">
        <noo-text-block
          dimmed
          size="small"
          class="noo-notification-item__content__footer__date"
        >
          {{ formattedDate }}
        </noo-text-block>
        <noo-inline-link
          v-if="notification.link"
          :to="notification.link"
          size="small"
          @click="$emit('navigate')"
        >
          {{ notification.linkText ?? 'Перейти' }}
        </noo-inline-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconName } from '@/components/icons/noo-icon.vue'
import type { NotificationEntity } from '@/core/api/endpoints/notification.types'
import { getNotificationIcon } from '@/core/api/endpoints/notification.utils'
import { DateHelpers } from '@/core/utils/dates'
import { computed } from 'vue'

interface Props {
  notification: NotificationEntity
}

interface Emits {
  (e: 'delete', id: string): void
  (e: 'navigate'): void
}

const props = defineProps<Props>()

defineEmits<Emits>()

const icon = computed<IconName>(() =>
  getNotificationIcon(props.notification.type)
)

const formattedDate = computed(() =>
  DateHelpers.formatRelative(props.notification.createdAt)
)
</script>

<style scoped lang="sass">
.noo-notification-item
  display: flex
  flex-direction: row
  gap: 0.5em
  padding: 0.75em 0.5em
  border-radius: var(--border-radius)
  border-left: 4px solid transparent

  &--unread
    background-color: var(--light)
    border-left-color: var(--secondary)

  &__icon
    font-size: 1.5em
    line-height: 1em

  &__content
    flex: 1
    min-width: 0

    &__head
      display: flex
      flex-wrap: nowrap
      align-items: center
      gap: 0.5em

      &__title
        flex: 1
        margin: 0
        padding: 0
        line-height: 1.3em
        overflow: hidden
        text-overflow: ellipsis

      &__close
        font-size: 1.1em
        line-height: 0.8em
        cursor: pointer
        color: var(--text-light)

        &:hover
          color: var(--form-text-color)

    &__text
      margin: 0.2em 0 0 0
      padding: 0

    &__footer
      display: flex
      align-items: center
      justify-content: space-between
      gap: 0.5em
      margin-top: 0.4em

      &__date
        margin: 0
        padding: 0
</style>
