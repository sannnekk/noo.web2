<template>
  <div
    ref="root"
    class="noo-dialog"
  >
    <div class="noo-dialog__trigger">
      <slot
        name="trigger"
        :toggle="toggle"
        :open="open"
        :close="close"
        :is-open="isOpen"
      />
    </div>
    <transition name="noo-dialog-pop">
      <div
        v-if="isOpen"
        class="noo-dialog__panel"
        :class="`noo-dialog__panel--${align}`"
        role="dialog"
      >
        <div
          v-if="$slots.title"
          class="noo-dialog__panel__title"
        >
          <slot name="title" />
        </div>
        <div class="noo-dialog__panel__content">
          <slot
            name="content"
            :close="close"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  /** Which edge of the trigger the panel is anchored to. */
  align?: 'left' | 'right'
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  closeOnEsc: true,
  closeOnOutsideClick: true
})

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const root = ref<HTMLElement | null>(null)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!props.closeOnOutsideClick) {
    return
  }

  if (root.value && !root.value.contains(event.target as Node)) {
    close()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (props.closeOnEsc && event.key === 'Escape') {
    close()
  }
}

// Only listen while open to avoid leaking global handlers for every dialog.
// `immediate` covers dialogs that are mounted already open (e.g. anchored popovers).
watch(
  isOpen,
  (opened) => {
    if (opened) {
      document.addEventListener('pointerdown', onDocumentPointerDown)
      document.addEventListener('keydown', onDocumentKeydown)
    } else {
      document.removeEventListener('pointerdown', onDocumentPointerDown)
      document.removeEventListener('keydown', onDocumentKeydown)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
})

defineExpose({ open, close, toggle })
</script>

<style scoped lang="sass">
.noo-dialog
  position: relative
  display: inline-flex

  &__trigger
    display: inline-flex

  &__panel
    position: absolute
    top: calc(100% + 0.4em)
    z-index: 100
    min-width: 16em
    max-width: min(90vw, 24em)
    padding: 0.8em
    background-color: var(--form-background)
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    box-shadow: 0 0.5em 1.5em rgba(0, 0, 0, 0.15)

    &--left
      left: 0

    &--right
      right: 0

    &__title
      font-weight: 500
      margin-bottom: 0.6em

.noo-dialog-pop-enter-active,
.noo-dialog-pop-leave-active
  transition: opacity 0.12s ease, transform 0.12s ease

.noo-dialog-pop-enter-from,
.noo-dialog-pop-leave-to
  opacity: 0
  transform: translateY(-0.3em)
</style>
