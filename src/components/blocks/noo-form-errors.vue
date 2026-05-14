<template>
  <noo-error-block
    v-if="errors.length > 0"
    no-margin
  >
    <ul class="noo-form-errors__list">
      <li
        v-for="(error, index) in errors"
        :key="index"
      >
        {{ error.message }}
      </li>
    </ul>
  </noo-error-block>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'

/**
 * Renders form-level (cross-field) validation errors that cannot be attached
 * to a single input — e.g. Zod root issues from `.refine` / `.superRefine`
 * checking multiple fields together.
 *
 * For errors that belong to a specific field, use the per-input `:errors`
 * prop (which renders via `<noo-input-error-list>`). Do not use this block
 * as a generic catch-all.
 */
interface Props {
  errors: ValidationError[]
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-form-errors
  &__list
    margin: 0
    padding-left: 1.2em
</style>
