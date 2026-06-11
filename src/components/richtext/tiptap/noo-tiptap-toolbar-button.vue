<template>
  <button
    type="button"
    class="noo-tiptap-toolbar-button"
    :class="{
      'noo-tiptap-toolbar-button--active': active,
      'noo-tiptap-toolbar-button--disabled': disabled || isLoading
    }"
    :title="title"
    :disabled="disabled || isLoading"
  >
    <noo-loader-icon v-if="isLoading" />
    <noo-richtext-icon
      v-else
      :icon="icon"
    />
  </button>
</template>

<script setup lang="ts">
import type { RichtextIcon } from '@/components/icons/noo-richtext-icon.vue'

interface Props {
  icon: RichtextIcon | 'color'
  title?: string
  active?: boolean
  disabled?: boolean
  isLoading?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-tiptap-toolbar-button
  padding: 0.4em 0
  margin: 0
  border: none
  background: transparent
  cursor: pointer
  color: var(--form-text-color)
  font-size: 1rem
  min-width: 2.5em
  display: inline-flex
  align-items: center
  justify-content: center

  &:hover
    background-color: var(--lightest)

  &--active
    background-color: var(--primary)
    color: var(--lightest)

  &--disabled
    cursor: not-allowed
    opacity: 0.4

    &:hover
      background-color: transparent
</style>
