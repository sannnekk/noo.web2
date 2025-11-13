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
          'noo-number-input__input--error': allErrors.length,
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
    <noo-input-error-list :errors="allErrors" />
  </label>
</template>

<script setup lang="ts">
import type {
  InputValidator,
  ValidationError
} from '@/core/validators/validation-helpers.utils'
import { computed, ref, watch } from 'vue'

interface Props {
  label: string
  max?: number
  min?: number
  placeholder?: string
  readonly?: boolean
  validators?: InputValidator<number>[]
  errors?: ValidationError[]
}

type Emits = (e: 'enter-press') => void

const props = defineProps<Props>()

defineEmits<Emits>()

const validationErrors = ref<ValidationError[]>([])
const allErrors = computed(() => [
  ...(props.errors ?? []),
  ...validationErrors.value
])

const model = defineModel<number | undefined | null>({
  default: null,
  required: false
})

const isValidModel = defineModel<true | ValidationError[]>('isValid', {
  default: true,
  required: false
})

watch(() => model.value, validateInput)

function validateInput(value: number | undefined | null) {
  validationErrors.value = []

  if (props.validators) {
    for (const validator of props.validators) {
      const result = validator(value ?? 0)

      if (result !== true) {
        validationErrors.value.push(...result)
        break
      }
    }
  }

  isValidModel.value =
    validationErrors.value.length === 0 ? true : validationErrors.value
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
</style>
