<template>
  <div class="noo-input">
    <div class="noo-input__head">
      <label class="noo-input__label">
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
    <div class="noo-input__input-container">
      <input
        v-model="model"
        class="noo-input__input"
        :class="{
          'noo-input__input--error': allErrors.length,
          'noo-input__input--readonly': readonly
        }"
        :type="type || 'text'"
        :placeholder="placeholder"
        :disabled="readonly"
        @keypress.enter="$emit('enter-press')"
      />
      <div
        v-if="copyButton"
        class="noo-input__copy-button"
        title="Копировать"
        @click="onCopy()"
      >
        <noo-icon
          :key="copyIcon"
          :name="copyIcon"
        />
      </div>
      <div class="noo-input__input-after">
        <slot name="after" />
      </div>
    </div>
    <noo-input-error-list :errors="allErrors" />
  </div>
</template>

<script setup lang="ts">
import type {
  InputValidator,
  ValidationError
} from '@/core/validators/validation-helpers.utils'
import { computed, ref, watch } from 'vue'
import type { IconName } from '../icons/noo-icon.vue'

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  copyButton?: boolean
  type?: 'text' | 'email' | 'password'
  validators?: InputValidator<string>[]
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

const model = defineModel<string | undefined | null>({
  default: undefined,
  required: false
})

const isValidModel = defineModel<true | ValidationError[]>('isValid', {
  default: true,
  required: false
})

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

const copyIcon = ref<IconName>('copy')

function onCopy() {
  // TODO: copy to clipboard
  copyIcon.value = 'check-green'

  setTimeout(() => {
    copyIcon.value = 'copy'
  }, 1000)
}
</script>

<style scoped lang="sass" src="./noo-input.sass"></style>
