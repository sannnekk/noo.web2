<template>
  <div class="session-card">
    <div class="session-card__header">
      <div class="session-card__device-info">
        <div class="session-card__device-name">
          <noo-title
            :size="5"
            no-margin
          >
            {{ session.device }}
          </noo-title>
        </div>
        <noo-text-block
          dimmed
          size="small"
          no-margin
        >
          {{ session.os }}
        </noo-text-block>
      </div>
      <noo-title
        :size="5"
        no-margin
      >
        {{ session.browser }}
      </noo-title>
    </div>
    <div class="session-card__footer">
      <noo-text-block
        size="small"
        dimmed
        no-margin
      >
        Последняя активность:
        <br />
        <noo-date
          timezones="local"
          :value="session.lastRequestAt"
          include-time
        />
      </noo-text-block>
    </div>

    <noo-button
      size="small"
      variant="danger-inline"
      :is-loading="isLoading"
      :disabled="isLoading"
      @click="$emit('delete')"
    >
      Выйти
    </noo-button>
  </div>
</template>

<script lang="ts" setup>
import type { SessionEntity } from '../api/session.types'

interface Props {
  session: SessionEntity
  isLoading?: boolean
}

interface Emits {
  delete: () => void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style lang="sass" scoped>
.session-card
  width: 100%
  display: flex
  flex-direction: column
  gap: 1rem
  padding: 1rem
  border-radius: var(--border-radius)
  background-color: var(--light)

  &__header
    display: flex
    justify-content: space-between
    align-items: flex-start

  &__device-info
    display: flex
    flex-direction: column
    gap: 0.25rem

  &__device-name
    display: flex
    align-items: center
    gap: 0.5rem

  &__footer
    display: flex
    justify-content: space-between
    align-items: center
</style>
