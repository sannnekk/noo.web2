<template>
  <noo-base-modal v-model:is-open="isOpen">
    <template #title>
      <slot name="title">
        <noo-title :size="2"> Подтвердите действие </noo-title>
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
        <slot name="confirm-action-text"> Подтвердить </slot>
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
