<template>
  <noo-base-modal v-model:is-open="isOpen">
    <template #title>
      <slot name="title">
        <noo-title :size="2">
          Подтвердите действие
        </noo-title>
      </slot>
    </template>
    <template #content>
      <slot name="content">
        <noo-text-block dimmed>
          Вы уверены, что хотите продолжить?
        </noo-text-block>
      </slot>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="onCancel()"
      >
        Отмена
      </noo-button>
      <noo-button
        variant="primary"
        @click="onConfirm()"
      >
        <slot name="confirm-action-text">
          Подтвердить
        </slot>
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const emits = defineEmits<Emits>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const onCancel = () => {
  emits('cancel')
  isOpen.value = false
}

const onConfirm = () => {
  emits('confirm')
  isOpen.value = false
}
</script>

<style scoped lang="sass">
.sure-modal
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 1000
  visibility: hidden
  z-index: 999

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
    width: 90%
    max-width: 500px
    max-height: 90%
    overflow-y: auto

    &::-webkit-scrollbar
      width: 0.5em

    &::-webkit-scrollbar-track
      background-color: var(--background)

    &::-webkit-scrollbar-thumb
      background-color: var(--border-color)
      border-radius: var(--border-radius)

  &__title
    font-size: 1.2em
    font-weight: 500
    margin-bottom: 0.5em

  &__text
    margin-bottom: 1em
    color: var(--text-light)

  &__buttons
    display: flex
    flex-direction: row
    justify-content: space-between

    &__cancel
      margin-right: 0.5em
</style>
