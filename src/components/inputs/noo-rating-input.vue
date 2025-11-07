<template>
  <label class="noo-rating-input">
    <span class="noo-rating-input__label">{{ label }}</span>
    <div class="noo-rating-input__input">
      <input
        v-model="model"
        class="noo-rating-input__input__field"
        type="range"
        :min="minRating"
        :max="maxRating"
        :step="onlyIntegers ? 1 : 0.25"
        :disabled="readonly"
      />
      <span class="noo-rating-input__input__value">{{ model }}</span>
    </div>
  </label>
</template>

<script setup lang="ts">
import type { StringDecoder } from 'node:string_decoder'

interface Props {
  label: StringDecoder
  readonly?: boolean
  minRating?: number
  maxRating?: number
  onlyIntegers?: boolean
}

const props = defineProps<Props>()

const model = defineModel<number | null>('modelValue', {
  default: null,
  get: (value) => value,
  set: (value) => {
    if (props.onlyIntegers && value !== null) {
      return Math.round(value)
    }

    return value
  }
})
</script>

<style scoped lang="sass">
.noo-rating-input
	&__label
		font-size: 0.8rem
		color: var(--text-light)

	&__input
		display: flex

		&__field
			flex: 1
			margin-top: 0.5em
			-webkit-appearance: none
			background-color: var(--border-color)
			border: none

		&__value
			margin-left: 0.5em
			font-size: 0.8rem
			color: var(--text-light)
</style>
