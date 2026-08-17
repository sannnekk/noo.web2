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
    <!--
      Teleported to the body because the menu routinely opens inside a
      scroll container — noo-search-view scrolls wide tables sideways, and a
      horizontal overflow makes the browser clip vertically too, cutting the
      menu off. Nothing a descendant can set escapes an ancestor's clip, so the
      menu leaves the flow entirely and is positioned against the trigger.
    -->
    <teleport to="body">
      <transition name="noo-dropdown__fade">
        <ul
          v-if="isOpen && visibleActions.length"
          ref="menuRef"
          class="noo-dropdown__menu"
          :style="menuStyle"
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
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties
} from 'vue'
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

const GAP = 4

const visibleActions = computed(() =>
  props.actions.filter((action) => action.if?.() ?? true)
)

const rootRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const menuStyle = ref<CSSProperties>({})

function toggle(): void {
  if (isOpen.value) {
    close()

    return
  }

  open()
}

async function open(): Promise<void> {
  isOpen.value = true
  positionMenu()

  // The menu has to exist before its height can decide whether it opens
  // downwards or flips above the trigger.
  await nextTick()
  positionMenu()
}

function positionMenu(): void {
  const trigger = rootRef.value

  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const menuHeight = menuRef.value?.offsetHeight ?? 0
  const opensUpwards =
    menuHeight > 0 &&
    rect.bottom + GAP + menuHeight > window.innerHeight &&
    rect.top - GAP - menuHeight > 0

  menuStyle.value = {
    position: 'fixed',
    top: opensUpwards
      ? `${rect.top - GAP - menuHeight}px`
      : `${rect.bottom + GAP}px`,
    ...(props.align === 'right'
      ? { right: `${window.innerWidth - rect.right}px` }
      : { left: `${rect.left}px` })
  }
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

// Fixed positioning does not follow the trigger, so anything that moves the
// trigger closes the menu rather than leaving it stranded mid-page.
function onViewportChange(): void {
  if (isOpen.value) {
    close()
  }
}

onMounted(() => {
  // Capture phase, so scrolling any ancestor container counts, not just the page.
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})

// The menu is no longer a descendant of the root, so it has to be excluded
// from the outside-click check explicitly.
onClickOutside(rootRef, close, { ignore: [menuRef] })
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

.noo-dropdown__menu
  position: fixed
  min-width: 12em
  list-style: none
  margin: 0
  padding: 0.3em 0
  border-radius: var(--border-radius)
  background: var(--form-background)
  box-shadow: var(--block-shadow)
  overflow: hidden
  // Above the modal layer, so a dropdown opened inside a dialog is not hidden
  // behind it.
  z-index: 1100

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

.noo-dropdown__fade-enter-active,
.noo-dropdown__fade-leave-active
  transition: opacity 0.12s ease-in-out, transform 0.12s ease-in-out

.noo-dropdown__fade-enter-from,
.noo-dropdown__fade-leave-to
  opacity: 0
  transform: translateY(-0.25em)
</style>
