<template>
  <noo-base-modal
    v-model:is-open="openModel"
    full-width
    :close-on-outside-click="!isLoading"
    :close-on-esc="!isLoading"
  >
    <template #title>
      <noo-title :size="2">
        {{ isNew ? 'Новый предмет' : 'Редактирование предмета' }}
      </noo-title>
    </template>
    <template #content>
      <div class="subject-edit-modal__form">
        <noo-text-input
          v-model="nameModel"
          label="Название"
          placeholder="Например: Математика"
          :validators="[validateName]"
        />
        <noo-text-input
          v-model="colorModel"
          label="Цвет"
          placeholder="#4caf50"
          :validators="[validateColor]"
        >
          <template #before>
            <label
              class="subject-edit-modal__swatch"
              :style="{
                backgroundColor: isColorValid ? colorModel : undefined
              }"
            >
              <input
                class="subject-edit-modal__swatch-input"
                type="color"
                :value="isColorValid ? colorModel : '#000000'"
                @input="onSwatchInput"
              />
            </label>
          </template>
        </noo-text-input>
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="primary"
        :is-loading="isLoading"
        :disabled="!canSave"
        @click="$emit('save')"
      >
        Сохранить
      </noo-button>
      <noo-button
        variant="secondary"
        :disabled="isLoading"
        @click="close()"
      >
        Отмена
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { isStringOfLength } from '@/core/validators/string.utils'
import { computed } from 'vue'

interface Props {
  name: string
  color: string
  isNew: boolean
  hasChanges: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'update:name', value: string): void
  (e: 'update:color', value: string): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

const nameModel = computed<string>({
  get: () => props.name,
  set: (value) => emits('update:name', value)
})

const colorModel = computed<string>({
  get: () => props.color,
  set: (value) => emits('update:color', value)
})

const isNameValid = computed(() => validateName(props.name) === true)
const isColorValid = computed(() => validateColor(props.color) === true)
const canSave = computed(
  () =>
    !props.isLoading &&
    props.hasChanges &&
    isNameValid.value &&
    isColorValid.value
)

function validateName(value: string): true | ValidationError[] {
  return isStringOfLength(value, 1, 32)
}

function validateColor(value: string): true | ValidationError[] {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return true
  }

  return [
    { kind: 'error', message: 'Цвет должен быть в формате HEX (#RRGGBB)' }
  ]
}

function onSwatchInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value

  colorModel.value = value
}
</script>

<style lang="sass" scoped>
.subject-edit-modal
  &__form
    display: flex
    flex-direction: column
    gap: 1em

  &__swatch
    display: inline-block
    width: 1.4em
    height: 1.4em
    border-radius: var(--border-radius)
    border: 1px solid var(--border-color)
    cursor: pointer
    overflow: hidden

  &__swatch-input
    opacity: 0
    width: 100%
    height: 100%
    cursor: pointer
    border: none
    padding: 0
</style>
