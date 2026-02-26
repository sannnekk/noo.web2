<template>
  <div class="noo-input">
    <div class="noo-input__head">
      <label
        v-if="label"
        class="noo-input__label"
      >
        {{ label }}
      </label>
      <span
        v-if="$slots.tooltip"
        class="noo-input__explanation-tooltip"
      >
        <noo-tooltip>
          <slot name="tooltip" />
        </noo-tooltip>
      </span>
    </div>
    <textarea
      v-model="model"
      class="noo-input__textarea"
      :class="{
        'noo-input__textarea--readonly': readonly,
        'noo-input__textarea--error': allErrors.length > 0
      }"
      :placeholder="placeholder"
      :readonly="readonly"
    />
    <noo-input-error-list
      :errors="allErrors"
      class="noo-input__errors"
    />
  </div>
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

<style scoped lang="sass" src="./noo-input.sass"></style>
