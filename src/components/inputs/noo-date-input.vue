<template>
  <div сlass="noo-input">
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
      <div class="noo-input__input-before">
        <slot name="before" />
      </div>
      <input
        v-model="inputModel"
        class="noo-input__input"
        :class="{
          'noo-input__input--error': allErrors.length,
          'noo-input__input--readonly': readonly
        }"
        :type="type || 'date'"
        :placeholder="placeholder"
        :disabled="readonly"
        @keypress.enter="$emit('enter-press')"
      />
      <div class="noo-input__input-after">
        <slot name="after" />
        <noo-icon
          v-if="resettable !== false && !readonly && model"
          name="cross-red"
          class="noo-input__reset-button"
          @click="resetValue"
        />
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

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  copyButton?: boolean
  type?: 'date' | 'datetime-local' | 'month' | 'week'
  validators?: InputValidator<Date | undefined | null>[]
  errors?: ValidationError[]
  resettable?: boolean
}

type Emits = (e: 'enter-press') => void

const props = defineProps<Props>()

defineEmits<Emits>()

const validationErrors = ref<ValidationError[]>([])
const allErrors = computed(() => [
  ...(props.errors ?? []),
  ...validationErrors.value
])

const model = defineModel<Date | undefined | null>({
  default: null,
  required: false
})

const isValidModel = defineModel<true | ValidationError[]>('isValid', {
  default: true,
  required: false
})

const inputModel = computed<string>({
  get: () => formatForInput(model.value ?? null, props.type ?? 'date'),
  set: (value) => {
    model.value = value ? parseFromInput(value, props.type ?? 'date') : null
  }
})

watch(() => model.value, validateInput)

function resetValue() {
  model.value = null
}

function validateInput(value: Date | undefined | null) {
  validationErrors.value = []

  if (props.validators) {
    for (const validator of props.validators) {
      const result = validator(value)

      if (result !== true) {
        validationErrors.value.push(...result)
        break
      }
    }
  }

  isValidModel.value =
    validationErrors.value.length === 0 ? true : validationErrors.value
}

function formatForInput(value: Date | null, type: Props['type']): string {
  if (!value) {
    return ''
  }

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')

  switch (type) {
    case 'datetime-local':
      return `${year}-${month}-${day}T${hours}:${minutes}`
    case 'month':
      return `${year}-${month}`
    case 'week':
      return formatWeek(value)
    case 'date':
    default:
      return `${year}-${month}-${day}`
  }
}

function parseFromInput(value: string, type: Props['type']): Date {
  switch (type) {
    case 'datetime-local':
      return new Date(value)
    case 'month':
      return new Date(`${value}-01T00:00:00`)
    case 'week':
      return parseWeek(value)
    case 'date':
    default:
      return new Date(`${value}T00:00:00`)
  }
}

function formatWeek(date: Date): string {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNumber = tmp.getUTCDay() || 7

  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNumber)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )

  return `${tmp.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

function parseWeek(value: string): Date {
  const [yearPart, weekPart] = value.split('-W')
  const year = Number(yearPart)
  const week = Number(weekPart)
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const dayOfWeek = simple.getUTCDay()
  const isoWeekStart =
    dayOfWeek <= 4
      ? new Date(simple.setUTCDate(simple.getUTCDate() - dayOfWeek + 1))
      : new Date(simple.setUTCDate(simple.getUTCDate() + 8 - dayOfWeek))

  return new Date(
    isoWeekStart.getUTCFullYear(),
    isoWeekStart.getUTCMonth(),
    isoWeekStart.getUTCDate()
  )
}
</script>

<style scoped lang="sass" src="./noo-input.sass"></style>
