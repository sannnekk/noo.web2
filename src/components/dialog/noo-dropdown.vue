<template>
  <div
    ref="rootRef"
    class="noo-dropdown"
  >
    <div
      class="noo-dropdown__trigger"
      @click="toggle"
    >
      <slot
        name="trigger"
        :is-open="isOpen"
      >
        <button
          type="button"
          class="noo-dropdown__trigger__default"
          :class="{ 'noo-dropdown__trigger__default--active': isOpen }"
          :aria-label="triggerLabel"
        >
          <noo-icon name="more" />
        </button>
      </slot>
    </div>
    <transition name="noo-dropdown__fade">
      <ul
        v-if="isOpen && visibleActions.length"
        class="noo-dropdown__menu"
        :class="`noo-dropdown__menu--${align}`"
      >
        <li
          v-for="(action, index) in visibleActions"
          :key="index"
          class="noo-dropdown__menu__item"
          :class="{
            'noo-dropdown__menu__item--danger': action.variant === 'danger',
            'noo-dropdown__menu__item--disabled': action.disabled
          }"
          @click="select(action)"
        >
          <noo-icon
            v-if="action.icon"
            :name="action.icon"
            class="noo-dropdown__menu__item__icon"
          />
          <span class="noo-dropdown__menu__item__label">
            {{ action.label }}
          </span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'
import type { IconName } from '../icons/noo-icon.vue'

export interface DropdownAction {
  label: string
  icon?: IconName
  variant?: 'default' | 'danger'
  disabled?: boolean
  if?: () => boolean
  onClick: () => void
}

interface Props {
  actions: DropdownAction[]
  align?: 'left' | 'right'
  triggerLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  align: 'right',
  triggerLabel: 'Действия'
})

const visibleActions = computed(() =>
  props.actions.filter((action) => action.if?.() ?? true)
)

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function toggle(): void {
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}

function select(action: DropdownAction): void {
  if (action.disabled) {
    return
  }

  action.onClick()
  close()
}

onClickOutside(rootRef, close)
</script>

<style scoped lang="sass">
.noo-dropdown
  position: relative
  display: inline-block

  &__trigger
    display: inline-flex

    &__default
      display: inline-flex
      align-items: center
      justify-content: center
      width: 2em
      height: 2em
      padding: 0
      border: none
      border-radius: var(--border-radius)
      background: transparent
      cursor: pointer

      &:hover,
      &--active
        background: var(--border-color)

  &__menu
    position: absolute
    top: calc(100% + 0.25em)
    min-width: 12em
    list-style: none
    margin: 0
    padding: 0.3em 0
    border-radius: var(--border-radius)
    background: var(--form-background)
    box-shadow: var(--block-shadow)
    overflow: hidden
    z-index: 4

    &--right
      right: 0

    &--left
      left: 0

    &__item
      display: flex
      align-items: center
      gap: 0.6em
      padding: 0.5em 0.9em
      cursor: pointer
      font-size: 0.9em
      line-height: 1.2em
      color: var(--form-text-color)
      white-space: nowrap

      &:hover
        background: var(--light-background-color)

      &--danger
        color: var(--danger)

      &--disabled
        opacity: 0.5
        cursor: not-allowed

        &:hover
          background: transparent

  &__fade-enter-active,
  &__fade-leave-active
    transition: opacity 0.12s ease-in-out, transform 0.12s ease-in-out

  &__fade-enter-from,
  &__fade-leave-to
    opacity: 0
    transform: translateY(-0.25em)
</style>
