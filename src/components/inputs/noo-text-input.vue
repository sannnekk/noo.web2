<template>
  <label сlass="noo-text-input">
    <span class="noo-text-input__label">
      {{ label }}
    </span>
    <div class="noo-text-input__input-container">
      <div class="noo-text-input__input-before">
        <slot name="before" />
      </div>
      <input
        v-model="model"
        class="noo-text-input__input"
        :class="{
          'noo-text-input__input--error': errors.length,
          'noo-text-input__input--readonly': readonly
        }"
        :type="type || 'text'"
        :placeholder="placeholder"
        :disabled="readonly"
        @keypress.enter="$emit('enter-press')"
      />
      <div
        v-if="copyButton"
        class="noo-text-input__copy-button"
        title="Копировать"
        @click="onCopy()"
      >
        <noo-icon
          :key="copyIcon"
          :name="copyIcon"
        />
      </div>
      <div class="noo-text-input__input-after">
        <slot name="after" />
      </div>
    </div>
    <span
      v-for="(error, index) in errors"
      :key="index"
      class="noo-text-input__error"
    >
      {{ error.message }}
    </span>
  </label>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { ref, watch } from 'vue'
import type { IconName } from '../icons/noo-icon.vue'

type InputValidator = (value: string) => true | ValidationError[]

interface Props {
  label: string
  placeholder?: string
  isValid?: true | ValidationError[]
  readonly?: boolean
  validators?: InputValidator[]
  copyButton?: boolean
  type?: 'text' | 'email' | 'password'
}

interface Emits {
  (e: 'update:is-valid', value: true | ValidationError[]): void
  (e: 'enter-press'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const errors = ref<ValidationError[]>([])

const model = defineModel<string | undefined | null>({
  default: undefined,
  required: false
})

watch(() => model.value, validateInput)

function validateInput(value: string | undefined | null) {
  errors.value = []

  if (props.validators) {
    for (const validator of props.validators) {
      const result = validator(value ?? '')

      if (result !== true) {
        errors.value.push(...result)
        break
      }
    }
  }

  emits('update:is-valid', errors.value.length === 0 ? true : errors.value)
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

<style scoped lang="sass">
.noo-text-input
  &__label
    font-size: 0.8em
    color: var(--text-light)

  &__explanation-tooltip
    color: var(--text-light)
    margin-bottom: 1em

  &__input-container
    position: relative

    &:hover
      .noo-text-input__copy-button
        visibility: visible

  &__copy-button
    position: absolute
    right: 0.2em
    top: 50%
    transform: translateY(-50%)
    font-size: 1.2em
    display: flex
    align-items: center
    justify-content: center
    visibility: hidden
    cursor: pointer
    background-color: var(--form-background)
    border-radius: 50%
    padding: 0.2em

    &:hover
      background-color: var(--border-color)

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
