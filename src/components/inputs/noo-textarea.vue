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
        'noo-text-area__textarea--readonly': readonly
      }"
      :placeholder="placeholder"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
}

defineProps<Props>()

const model = defineModel<string | null>('modelValue', {
  default: null
})
</script>

<style scoped lang="sass">
.noo-text-area
  &__label
    font-size: 0.8em
    color: var(--text-light)

  &__textarea
    width: 100%
    padding: 1rem 1rem
    border-radius: var(--border-radius)
    border: 1px solid var(--border-color)
    outline: none
    transition: border-color 0.2s ease-in-out
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
</style>
