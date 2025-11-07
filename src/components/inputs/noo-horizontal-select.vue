<template>
  <div class="noo-horizontal-select">
    <div
      v-for="option in options"
      :key="option"
      class="noo-horizontal-select__option"
      :class="{ 'noo-horizontal-select__option--selected': model === option }"
      @click="model = option"
    >
      {{ option }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  options: string[]
}

defineProps<Props>()

const model = defineModel<string>('modelValue', {
  default: ''
})
</script>

<style scoped lang="sass">
.noo-horizontal-select
	display: flex
	border: 1px solid var(--border-color)
	border-radius: var(--border-radius)
	overflow: hidden
	width: fit-content

	&__option
		padding: 0.5em 0.7em
		display: flex
		align-items: center
		justify-content: center
		color: var(--form-text-color)
		cursor: pointer

		&:not(:last-child)
			border-right: 1px solid var(--border-color)

		&--selected
			background-color: var(--lila)
			color: var(--form-background)
			font-weight: bold

		&:not(&--selected):hover
			background-color: var(--border-color)
</style>
