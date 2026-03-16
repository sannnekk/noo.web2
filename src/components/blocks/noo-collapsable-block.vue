<template>
  <div
    class="noo-collapsable-block"
    :class="{ 'noo-collapsable-block--inline': variant === 'inline' }"
  >
    <div
      class="noo-collapsable-block__collapsed"
      @click="isOpen = !isOpen"
    >
      <div
        class="noo-collapsable-block__collapsed__arrow"
        :class="{ 'noo-collapsable-block__collapsed__arrow--open': isOpen }"
      >
        <noo-icon name="arrow-right" />
      </div>
      <slot name="collapsed" />
    </div>
    <noo-if-animation>
      <div
        v-show="isOpen"
        class="noo-collapsable-block__visible"
      >
        <slot name="visible" />
      </div>
    </noo-if-animation>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  variant?: 'normal' | 'inline'
}

defineProps<Props>()

const isOpen = ref(false)
</script>

<style scoped lang="sass">
.noo-collapsable-block

  &--inline
    .noo-collapsable-block__collapsed
      padding: 0
      background-color: transparent
      margin-bottom: 0.5em

  &__collapsed
    background-color: var(--light-background-color)
    padding: 0.1em 1em
    border-radius: var(--border-radius)
    cursor: pointer
    display: flex
    align-items: center
    gap: 0.5em

    &__arrow
      transition: transform 0.2s ease-in-out
      font-size: 1.1em
      --form-text-color: var(--text-light)

      &--open
        transform: rotate(90deg)
</style>
