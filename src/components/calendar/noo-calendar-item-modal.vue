<template>
  <noo-base-modal
    v-if="event"
    v-model:is-open="openedModel"
    close-on-outside-click
    close-on-esc
  >
    <template #title>
      <noo-text-block dimmed>
        <span class="noo-calendar-item-modal__date">
          <noo-date
            :value="event.startDateTime"
            include-time
            timezones="both"
          />
        </span>
        <span
          v-if="event.startDateTime && event.endDateTime"
          class="noo-calendar-item-modal__duration"
        >
          Длительность:
          <noo-duration
            :from="event.startDateTime"
            :to="event.endDateTime"
          />
        </span>
      </noo-text-block>
      <noo-title :size="2">
        <noo-color-badge :color="getEventColor(event.type)" />
        {{ event.title || 'Новое событие' }}
      </noo-title>
    </template>
    <template #content>
      <noo-text-block
        v-if="event.description"
        class="noo-calendar-item-modal__description"
      >
        {{ event.description }}
      </noo-text-block>
    </template>
    <template #actions="{ close }">
      <noo-button
        v-if="!readonly && changed"
        variant="primary"
        @click="$emit('save')"
      >
        Сохранить
      </noo-button>
      <noo-button
        v-if="event.type === 'custom'"
        variant="danger"
        @click="$emit('delete')"
      >
        Удалить
      </noo-button>
      <noo-button
        variant="secondary"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import type { CalendarEventEntity } from '@/modules/calendar/api/calendar.types'
import { shallowRef } from 'vue'
import { getEventColor } from './calendar-helpers'

interface Props {
  event: CalendarEventEntity | null
  readonly?: boolean
}

interface Emits {
  (e: 'save'): void
  (e: 'delete'): void
}

defineProps<Props>()
defineEmits<Emits>()

const openedModel = defineModel<boolean>('isOpen', {
  default: false
})

const changed = shallowRef(false)
</script>

<style scoped lang="sass">
.noo-calendar-item-modal
  &__duration
    display: block
    font-size: 0.8em
</style>
