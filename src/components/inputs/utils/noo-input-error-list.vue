<template>
  <div class="noo-input-error-list">
    <span
      v-for="({ kind, message }, index) in errors"
      :key="index"
      :class="`noo-input-error-list__${kind}`"
    >
      {{ message }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'

interface Props {
  errors?: ValidationError[]
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.noo-input-error-list
  display: flex
  flex-direction: column
  gap: 0.2em
  font-size: 0.85rem

  &__error
    color: var(--danger)

  &__warning
    color: var(--warning)
</style>
