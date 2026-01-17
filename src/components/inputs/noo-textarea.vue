<template>
  <div class="noo-text-area">
    <label
      v-if="label"
      class="noo-text-area__label"
    >
      {{ label }}
    </label>
    <textarea
      v-model="model"
      class="noo-text-area__textarea"
      :class="{
        'noo-text-area__textarea--readonly': readonly,
        'noo-text-area__textarea--error': allErrors.length > 0
      }"
      :placeholder="placeholder"
      :readonly="readonly"
    />
  </div>
  <noo-input-error-list
    :errors="allErrors"
    class="noo-text-area__errors"
  />
</template>

<script setup lang="ts">
import type {
  InputValidator,
  ValidationError
} from '@/core/validators/validation-helpers.utils'
import { computed, ref, watch } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  validators?: InputValidator<string>[]
  errors?: ValidationError[]
}

const props = defineProps<Props>()

const model = defineModel<string | null>('modelValue', {
  default: null
})

const isValidModel = defineModel<true | ValidationError[]>('isValid', {
  default: true,
  required: false
})

const validationErrors = ref<ValidationError[]>([])
const allErrors = computed(() => [
  ...(props.errors ?? []),
  ...validationErrors.value
])

watch(() => model.value, validateInput)

function validateInput(value: string | undefined | null) {
  validationErrors.value = []

  if (props.validators) {
    for (const validator of props.validators) {
      const result = validator(value ?? '')

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
.noo-text-area
  margin-bottom: -0.5em

  &__label
    font-size: 0.8em
    color: var(--text-light)

  &__textarea
    width: 100%
    padding: 0.7em 0.8em
    border-radius: var(--border-radius)
    border: 1px solid var(--border-color)
    outline: none
    resize: vertical
    font-family: inherit
    min-height: 5em
    color: var(--form-text-color)
    background: var(--form-background)

    &--readonly
      background: var(--light-background-color)
      color: var(--text-light)

    &--error
      border-color: var(--danger)

    &:focus
      outline: none
      border-color: var(--primary)

  &__errors
    margin-bottom: 0.5em
</style>
