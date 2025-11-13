<template>
  <div
    class="noo-toast"
    :class="`noo-toast--${type}`"
  >
    <div class="noo-toast__icon">
      <noo-icon :name="toastIcon" />
    </div>
    <div class="noo-toast__content">
      <div class="noo-toast__content__head">
        <noo-title
          class="noo-toast__content__head__title"
          :size="4"
        >
          {{ title }}
        </noo-title>
        <span
          class="noo-toast__content__head__close"
          @click="$emit('close')"
        >
          <noo-icon name="close" />
        </span>
      </div>
      <noo-text-block
        class="noo-toast__content__text"
        dimmed
        size="small"
      >
        {{ text }}
      </noo-text-block>
      <div class="noo-toast__content__actions">
        <slot
          name="actions"
          :toast="props"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Toast } from '@/core/stores/global-ui.store'
import { computed } from 'vue'
import type { IconName } from '../icons/noo-icon.vue'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends Toast {}

type Emits = (e: 'close') => void

const props = defineProps<Props>()

defineEmits<Emits>()

const toastIcon = computed<IconName>(() => {
  if (props.icon) {
    return props.icon as IconName
  }

  switch (props.type) {
    case 'error':
      return 'cross-red'
    case 'success':
      return 'check-green'
    case 'warning':
      return 'attention-yellow'
    case 'info':
    default:
      return 'info'
  }
})
</script>

<style lang="sass" scoped>
.noo-toast
  width: 100%
  background: var(--lightest)
  border-left: 10px solid var(--lightest)
  border-radius: var(--border-radius)
  box-shadow: var(--block-shadow)
  padding: 1em 0.7em
  display: flex
  flex-direction: row
  gap: 0.5em
  pointer-events: all

  &--success
    border-color: var(--success)

  &--warning
    border-color: var(--warning)

  &--error
    border-color: var(--danger)

  &--info
    border-color: var(--info)

  &__icon
    font-size: 2em

  &__content
    flex: 1

    &__head
      display: flex
      flex-wrap: nowrap
      align-items: center
      gap: 0.5em

      &__title
        flex: 1
        margin: 0
        padding: 0
        overflow: hidden
        text-overflow: ellipsis
        line-height: 1.3em
        margin-bottom: 0.3em

      &__close
        font-size: 1.4em
        line-height: 0.8em
        cursor: pointer

        &:hover
          --text-light: var(--form-text-color)

    &__text
      margin: 0
      padding-top: 0
</style>
