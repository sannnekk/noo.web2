<template>
  <label сlass="noo-number-input">
    <span class="noo-number-input__label">
      {{ label }}
    </span>
    <div class="noo-number-input__input-container">
      <div class="noo-number-input__input-before">
        <slot name="before" />
      </div>
      <input
        v-model="model"
        class="noo-number-input__input"
        :class="{
          'noo-number-input__input--error': errors.length,
          'noo-number-input__input--readonly': readonly
        }"
        type="number"
        :placeholder="placeholder"
        :disabled="readonly"
        :max="max"
        :min="min"
        @keypress.enter="$emit('enter-press')"
      />
      <div class="noo-number-input__input-after">
        <slot name="after" />
      </div>
    </div>
    <span
      v-for="(error, index) in errors"
      :key="index"
      class="noo-number-input__error"
    >
      {{ error.message }}
    </span>
  </label>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { ref, watch } from 'vue'

type InputValidator = (value: number) => true | ValidationError[]

interface Props {
  label: string
  max?: number
  min?: number
  placeholder?: string
  isValid?: true | ValidationError[]
  readonly?: boolean
  validators?: InputValidator[]
}

interface Emits {
  (e: 'update:is-valid', value: true | ValidationError[]): void
  (e: 'enter-press'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const errors = ref<ValidationError[]>([])

const model = defineModel<number | undefined | null>({
  default: null,
  required: false
})

watch(() => model.value, validateInput)

function validateInput(value: number | undefined | null) {
  errors.value = []

  if (props.validators) {
    for (const validator of props.validators) {
      const result = validator(value ?? 0)

      if (result !== true) {
        errors.value.push(...result)
        break
      }
    }
  }

  emits('update:is-valid', errors.value.length === 0 ? true : errors.value)
}
</script>

<style scoped lang="sass">
.noo-number-input
  &__label
    font-size: 0.8em
    color: var(--text-light)

  &__explanation-tooltip
    color: var(--text-light)
    margin-bottom: 1em

  &__input-container
    position: relative

    &:hover
      .noo-number-input__copy-button
        visibility: visible

  &__input
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
    outline: none
    padding: 0.5em 0.8em
    box-sizing: border-box
    font-family: inherit
    width: 100%
    min-width: 100%
    max-width: 100%
    background: var(--form-background)
    color: var(--form-text-color)
    display: block
    font-size: 0.9em
    line-height: 1
    height: 2.4em

    &:focus
      border-color: var(--primary)

    &--error
      border-color: var(--danger) !important

    &--readonly
      background: var(--light)
      opacity: 0.7

  &__error
    font-size: 0.8rem
    color: var(--danger)
    margin-top: 0.2em
    line-height: 0.95em
    display: block
</style>
