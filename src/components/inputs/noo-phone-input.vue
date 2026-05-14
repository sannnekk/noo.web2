<template>
  <div class="noo-input">
    <label class="noo-input__label">
      {{ label }}
    </label>
    <intl-tel-input
      ref="iti"
      :model-value="modelValue"
      initial-country="ru"
      :disabled="readonly"
      country-name-locale="ru"
      :i18n="ru"
      use-precise-validation
      allow-number-extensions
      format-as-you-type
      :load-utils="() => import('intl-tel-input/utils')"
      :input-props="{
        class: inputClassString,
        placeholder: '999 999 99 99'
      }"
      @update:model-value="onUpdateModelValue"
      @change-number="syncValidity"
      @change-error-code="onChangeErrorCode"
    />
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script lang="ts" setup>
import IntlTelInput from '@intl-tel-input/vue'
import 'intl-tel-input/styles'
import { ru } from 'intl-tel-input/i18n'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

type IntlErrorCode =
  | 'IS_POSSIBLE'
  | 'INVALID_COUNTRY_CODE'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'IS_POSSIBLE_LOCAL_ONLY'
  | 'INVALID_LENGTH'

const props = defineProps<Props>()

const errorMessages: Record<IntlErrorCode, string> = {
  IS_POSSIBLE: 'Введите корректный номер телефона',
  INVALID_COUNTRY_CODE: 'Неверный код страны',
  TOO_SHORT: 'Слишком короткий номер',
  TOO_LONG: 'Слишком длинный номер',
  IS_POSSIBLE_LOCAL_ONLY: 'Введите номер в международном формате',
  INVALID_LENGTH: 'Неверная длина номера'
}

interface Props {
  readonly?: boolean
  label?: string
}

const modelValue = defineModel<string | null>()
const isValidModel = defineModel<true | ValidationError[]>('isValid', {
  default: true,
  required: false
})

const iti = ref<InstanceType<typeof IntlTelInput> | null>(null)
const isValid = ref(true)
const errorCode = ref<IntlErrorCode | null>(null)

const isEmpty = computed(() => !modelValue.value)

const errors = computed<ValidationError[]>(() => {
  if (isEmpty.value || isValid.value) {
    return []
  }

  const message = errorCode.value
    ? errorMessages[errorCode.value]
    : 'Введите корректный номер телефона'

  return [{ kind: 'error', message }]
})

const inputClassMap = computed(() => ({
  'noo-input__input': true,
  'noo-input__input--error': errors.value.length > 0,
  'noo-input__input--readonly': props.readonly
}))

const inputClassString = computed(() =>
  Object.entries(inputClassMap.value)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(' ')
)

function onUpdateModelValue(value: string): void {
  modelValue.value = value === '' ? null : value
}

function syncValidity(): void {
  const instance = iti.value?.instance ?? null

  if (!instance) {
    return
  }

  const valid = instance.isValidNumberPrecise()

  if (valid !== null) {
    isValid.value = valid
  }
}

function onChangeErrorCode(value: IntlErrorCode | null): void {
  errorCode.value = value
}

onMounted(async () => {
  await nextTick()
  const instance = iti.value?.instance

  if (!instance) {
    return
  }

  await instance.promise
  syncValidity()
})

watch(
  errors,
  (newErrors) => {
    isValidModel.value = newErrors.length === 0 ? true : newErrors
  },
  { immediate: true }
)
</script>

<style lang="sass" scoped>
.noo-input
  &__label
    display: block
    margin-bottom: 0.1em

  &:deep()
    .iti--input-container
      width: 100%

    .iti__search-icon
      display: none !important

    .iti__search-input
      border-color: var(--border-color)
      background-color: var(--form-background)
      color: var(--form-text-color)
      padding: 0.5em 0.8em
      border-radius: var(--border-radius)
      outline: none

    .iti__dropdown-content
      background: var(--form-background)
      color: var(--form-text-color)
      font-size: 0.8em
      border-radius: var(--border-radius)
      border: 1px solid var(--border-color)

    .iti__search-input-wrapper
      border-bottom: 1px solid var(--border-color)
</style>

<style scoped lang="sass" src="./noo-input.sass"></style>
