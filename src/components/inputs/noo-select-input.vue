<template>
  <div class="noo-select-input">
    <label class="noo-select-input__label">
      <span class="noo-select-input__label-text">{{ label }}</span>
      <select
        v-model="model"
        :disabled="readonly"
        class="noo-select-input__select"
        :class="{
          'noo-select-input__select--readonly': readonly,
          'noo-select-input__select--error': errors?.length
        }"
      >
        <option
          v-for="option in options"
          :key="option.label"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script setup lang="ts" generic="T">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'

interface Props {
  label: string
  options: {
    label: string
    value: T
  }[]
  readonly?: boolean
  errors?: ValidationError[]
}

defineProps<Props>()

const model = defineModel<T>({
  default: null,
  required: true
})
</script>

<style scoped lang="sass">
.noo-select-input
  &__label
    color: var(--text-light)

  &__label-text
    font-size: 0.8em
    margin-right: 0.5em

  &__select
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    outline: none
    padding: 0.5em 0.8em
    box-sizing: border-box
    font-size: 0.9em
    font-family: inherit
    width: 100%
    height: 2.4em
    background: var(--form-background)
    color: var(--form-text-color)
    line-height: 1

    &--error
      border-color: var(--danger) !important

    &:focus
      border-color: var(--primary)

    &--readonly
      background: var(--light)
      opacity: 0.7
</style>
