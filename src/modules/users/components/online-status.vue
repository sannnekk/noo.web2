<template>
  <div class="online-status">
    <noo-text-block
      dimmed
      size="small"
      no-margin
    >
      <span
        class="online-status__indicator"
        :class="statusClass"
      ></span>
      <span :class="statusClass">{{ statusText }}</span>
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOnline: boolean
  lastOnlineAt: Date | null
}

const props = defineProps<Props>()

const statusClass = computed(() => {
  return props.isOnline ? 'online' : 'offline'
})

const statusText = computed(() => {
  if (props.isOnline) {
    return 'Онлайн'
  } else if (props.lastOnlineAt) {
    const lastOnlineDate = new Date(props.lastOnlineAt)
    const now = new Date()
    const diffInSeconds = Math.floor(
      (now.getTime() - lastOnlineDate.getTime()) / 1000
    )

    if (diffInSeconds < 60) {
      return `Был(а) онлайн ${diffInSeconds} секунд назад`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)

      return `Был(а) онлайн ${minutes} минут назад`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)

      return `Был(а) онлайн ${hours} часов назад`
    } else {
      const days = Math.floor(diffInSeconds / 86400)

      return `Был(а) онлайн ${days} дней назад`
    }
  } else {
    return 'Оффлайн'
  }
})
</script>

<style lang="sass" scoped>
.online-status
  display: flex
  align-items: center

  .online
    color: var(--success)
    font-weight: 500

  &__indicator
    width: 1em
    height: 1em
    border-radius: 50%
    margin-right: 0.1em

    &.online
      background-color: var(--success)

    &.offline
      background-color: var(--warning)
</style>
