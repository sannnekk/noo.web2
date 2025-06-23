<template>
  <div
    class="noo-checkbox"
    @click.stop
  >
    <label class="noo-checkbox__label">
      <input
        v-model="model"
        class="noo-checkbox__input"
        type="checkbox"
        :disabled="readonly"
      />
      <span class="noo-checkbox__text">
        <div
          class="noo-checkbox__box"
          :class="{
            'noo-checkbox__box--checked': model,
            'noo-checkbox__box--readonly': readonly
          }"
        >
          <div
            class="noo-checkbox__check"
            :style="{ opacity: model ? 1 : 0 }"
          >
            <svg
              class="noo-checkbox__check-icon"
              viewBox="0 -2 12 9"
              width="0.8em"
              height="0.8em"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5L4 8L11 1"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <noo-text-block
          :size="size"
          :dimmed="dimmed"
          inline
        >
          <slot />
        </noo-text-block>
      </span>
    </label>
    <span
      v-for="(error, index) in errors"
      :key="index"
      class="noo-checkbox__error"
    >
      {{ error.message }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { shallowRef, watch } from 'vue'
import type { ButtonSize } from '../buttons/noo-button.vue'

interface Props {
  isValid?: true | ValidationError[]
  readonly?: boolean
  validators?: ((value: boolean) => true | ValidationError[])[]
  size?: ButtonSize
  dimmed?: boolean
}

type Emits = (event: 'update:is-valid', value: true | ValidationError[]) => void

const props = defineProps<Props>()

const emits = defineEmits<Emits>()

const model = defineModel<boolean | undefined>('modelValue', {
  default: undefined
})

const errors = shallowRef<ValidationError[]>([])

watch(model, validateInput, { immediate: true })

function validateInput(value: boolean | undefined) {
  errors.value = []

  if (props.validators) {
    for (const validator of props.validators) {
      const result = validator(value!)

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
.noo-checkbox
  user-select: none

  &__box
    aspect-ratio: 1 / 1
    width: 1.2em
    height: 1.2em
    max-width: 1.2em
    max-height: 1.2em
    overflow: hidden
    border: 1px solid var(--border-color)
    border-radius: 4px
    margin-right: 0.4em
    display: inline-flex
    align-items: center
    justify-content: center
    cursor: pointer
    float: left
    position: relative
    top: 3px

    &--checked
      background-color: var(--secondary)
      border-color: var(--secondary)

    &--readonly
      background-color: var(--light)

  &__text
    cursor: pointer

  &__input
    display: none

  &__error
    font-size: 0.8rem
    color: var(--danger)
    margin-top: 0.2em
    line-height: 0.95em
    display: block
</style>
