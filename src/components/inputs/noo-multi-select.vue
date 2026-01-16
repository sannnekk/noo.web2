<template>
  <div class="noo-multi-select">
    <div class="noo-multi-select__label">
      <span class="noo-multi-select__label-text">{{ label }}</span>
      <noo-list-transition
        tag="ul"
        class="noo-multi-select__options"
      >
        <li
          v-for="(option, index) in optionsToShow"
          :key="option.value"
          class="noo-multi-select__options__option"
        >
          <noo-checkbox
            :model-value="isSelected(option.value)"
            :value="option.value"
            :readonly="isReadonly(option.value)"
            @update:model-value="
              (checked) => toggleValue(option.value, Boolean(checked))
            "
          >
            {{ option.label }}
            <span class="noo-multi-select__options__option__count-remaining">
              {{
                index === 0 && model.length > 1 && !expanded
                  ? `+${model.length - 1}`
                  : ''
              }}
            </span>
          </noo-checkbox>
        </li>
        <li
          class="noo-multi-select__options__more"
          @click="expanded = !expanded"
        >
          <noo-list-opener-icon
            :opened="expanded"
            type="vertical"
          />
          Показать {{ expanded ? 'меньше' : 'больше' }}
        </li>
      </noo-list-transition>
    </div>
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script setup lang="ts" generic="T extends string">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed, ref } from 'vue'

interface Props {
  label: string
  options: {
    label: string
    value: T
  }[]
  readonly?: boolean
  maxSelections?: number
  errors?: ValidationError[]
  expandable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  maxSelections: 5
})

const model = defineModel<T[]>({
  default: () => []
})

const expanded = ref(false)

const optionsToShow = computed(() => {
  if (!props.expandable) {
    return props.options
  }

  return expanded.value ? props.options : props.options.slice(0, 1)
})

function isSelected(value: T): boolean {
  return model.value.includes(value)
}

function isReadonly(value: T): boolean {
  if (model.value.includes(value)) {
    return false
  }

  if (!props.maxSelections) {
    return props.readonly
  }

  if (props.readonly) {
    return true
  }

  return model.value.length >= props.maxSelections
}

function toggleValue(value: T, checked: boolean) {
  if (props.readonly) {
    return
  }

  if (checked) {
    if (model.value.includes(value)) {
      return
    }

    if (props.maxSelections && model.value.length >= props.maxSelections) {
      return
    }

    model.value = [...model.value, value]

    return
  }

  model.value = model.value.filter((entry) => entry !== value)
}
</script>

<style scoped lang="sass">
.noo-multi-select
  &__label
    color: var(--text-light)

  &__label-text
    font-size: 0.8em
    margin-right: 0.5em

  &__options
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))
    gap: 0.5em 1em
    padding: 0
    margin: 0.2em 0 0
    //border: 1px solid var(--border-color)
    //border-radius: var(--border-radius)
    //background: var(--form-background)
    color: var(--form-text-color)
    list-style: none

    &__option
      margin: 0
      font-size: 0.9em

      :deep() p
        position: relative
        top: 0.15em

      &__count-remaining
        font-weight: 700
        color: var(--secondary)
        margin-left: 0.3em

    &__more
      display: flex
      gap: 0.3em
      height: 0.5em
      font-size: 0.7em
      color: var(--text-light)

      &:hover
        cursor: pointer
        color: var(--form-text-color)
</style>
