<template>
  <teleport to="body">
    <div
      class="noo-base-modal"
      :class="{ 'noo-base-modal--visible': openedModel }"
      @keydown.esc="closeOnEsc && close()"
    >
      <div
        v-if="openedModel"
        class="noo-base-modal__inner"
        @click.self="closeOnOutsideClick && close()"
      >
        <div
          class="noo-base-modal__container"
          :class="{
            'noo-base-modal__container--full-width': fullWidth
          }"
        >
          <div class="noo-base-modal__container__title">
            <slot name="title" />
          </div>
          <div class="noo-base-modal__container__content">
            <slot name="content" />
          </div>
          <div class="noo-base-modal__container__actions">
            <slot
              name="actions"
              :close="close"
            />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  closeOnEsc: true,
  closeOnOutsideClick: true,
  fullWidth: false
})

const openedModel = defineModel<boolean>('isOpen', {
  default: false
})

function close() {
  openedModel.value = false
}
</script>

<style scoped lang="sass">
.noo-base-modal
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 1000
  visibility: hidden

  &--visible
    visibility: visible

  &__inner
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background-color: rgba(0, 0, 0, 0.5)
    display: flex
    justify-content: center
    align-items: center

  &__container
    background-color: var(--lightest)
    border-radius: var(--border-radius)
    padding: 1em
    width: min(95%, 700px)
    max-height: 90%
    overflow-y: auto

    &--full-width
      width: min(1100px, 100%)

    &::-webkit-scrollbar
      width: 0.5em

    &::-webkit-scrollbar-track
      background-color: var(--background)

    &::-webkit-scrollbar-thumb
      background-color: var(--border-color)
      border-radius: var(--border-radius)

    &__actions
      display: flex
      justify-content: flex-end
      gap: 0.5em
      margin-top: 0.5em
</style>
