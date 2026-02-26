<template>
  <div class="noo-input">
    <div class="noo-input__head">
      <label class="noo-input__label">
        <span class="noo-select-input__label-text">{{ label }}</span>
      </label>
      <span
        v-if="$slots.tooltip"
        class="noo-input__explanation-tooltip"
      ></span>
    </div>
    <select
      v-model="model"
      :disabled="readonly"
      class="noo-input__select"
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
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script setup lang="ts" generic="T">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'

interface Props {
  label: string
  options: {
    label: string
    value: T | null
  }[]
  readonly?: boolean
  errors?: ValidationError[]
}

defineProps<Props>()

const model = defineModel<T | null>({
  default: null,
  required: true
})
</script>

<style scoped lang="sass" src="./noo-input.sass"></style>
