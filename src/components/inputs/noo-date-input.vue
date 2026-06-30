<template>
  <div class="noo-date-input noo-input">
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
      <vue-date-picker
        v-model="pickerModel"
        class="noo-date-input__picker"
        :class="{ 'noo-date-input__picker--error': allErrors.length }"
        :time-config="timeConfig"
        :month-picker="isMonth"
        :week-picker="isWeek"
        :formats="formats"
        :input-attrs="inputAttrs"
        :ui="{ menu: 'noo-date-input__menu' }"
        :disabled="readonly"
        :teleport="true"
        :week-start="1"
        :locale="locale"
        text-input
        auto-apply
        :placeholder="placeholder"
      />
    </div>
    <noo-input-error-list :errors="allErrors" />
  </div>
</template>

<script setup lang="ts">
import type {
  InputValidator,
  ValidationError
} from '@/core/validators/validation-helpers.utils'
import { DateHelpers, type DateParts } from '@/core/utils/dates'
import { ruLocale } from '@/core/utils/dates.ru-locale'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, ref, watch } from 'vue'

// `date-fns` is not a direct dependency, so borrow the picker's own `locale`
// prop type and feed it our Intl-built Russian locale.
type DatePickerLocale = InstanceType<typeof VueDatePicker>['$props']['locale']
const props = defineProps<Props>()

defineEmits<Emits>()

const locale = ruLocale as unknown as DatePickerLocale

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  type?: 'date' | 'datetime-local' | 'month' | 'week'
  validators?: InputValidator<Date | undefined | null>[]
  errors?: ValidationError[]
  resettable?: boolean
  /**
   * For a date-only input, default the picked day to the very end of the day
   * (23:59:59 Moscow time) instead of midnight. Useful for deadlines.
   */
  endOfDay?: boolean
}

type Emits = (e: 'enter-press') => void

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

const resolvedType = computed(() => props.type ?? 'date')
const isDateTime = computed(() => resolvedType.value === 'datetime-local')
const isMonth = computed(() => resolvedType.value === 'month')
const isWeek = computed(() => resolvedType.value === 'week')

const displayFormat = computed(() => {
  switch (resolvedType.value) {
    case 'datetime-local':
      return 'dd.MM.yyyy, HH:mm'
    case 'month':
      return 'LLLL yyyy'
    default:
      return 'dd.MM.yyyy'
  }
})

const formats = computed(() => ({ input: displayFormat.value }))

const timeConfig = computed(() => ({
  enableTimePicker: isDateTime.value,
  enableSeconds: false,
  is24: true
}))

const inputAttrs = computed(() => ({ clearable: props.resettable === true }))

/**
 * The datepicker speaks plain `Date` objects (and `{ month, year }` for the
 * month picker) read through their local getters. We mediate so the wall-clock
 * the user sees and edits is always Moscow time, matching how the backend
 * stores and renders the value.
 */
type PickerValue = Date | Date[] | { month: number; year: number } | null

const pickerModel = computed<PickerValue>({
  get: () => {
    if (!model.value) {
      return null
    }

    const parts = DateHelpers.toMoscowParts(model.value)

    if (isMonth.value) {
      return { month: parts.month - 1, year: parts.year }
    }

    // Naive local Date whose local fields equal the Moscow wall-clock fields.
    return new Date(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    )
  },
  set: (value) => {
    model.value = toInstant(value)
  }
})

function toInstant(value: PickerValue): Date | null {
  if (!value) {
    return null
  }

  const source = Array.isArray(value) ? value[0] : value
  const parts: DateParts =
    source instanceof Date
      ? {
          year: source.getFullYear(),
          month: source.getMonth() + 1,
          day: source.getDate(),
          hour: source.getHours(),
          minute: source.getMinutes(),
          second: source.getSeconds()
        }
      : {
          year: source.year,
          month: source.month + 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0
        }

  if (props.endOfDay && resolvedType.value === 'date') {
    parts.hour = 23
    parts.minute = 59
    parts.second = 59
  }

  return DateHelpers.fromMoscowParts(parts)
}

watch(() => model.value, validateInput)

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
</script>

<style scoped lang="sass" src="./noo-input.sass"></style>
<style scoped lang="sass">
.noo-date-input
  :deep(.dp--main)
    width: 100%

  :deep(.dp--input)
    min-height: 2.4em

  &__picker--error
    :deep(.dp--input)
      border-color: var(--danger)
</style>

<!--
  The picker's menu is teleported to <body>, so this shadow rule is global
  (not scoped). The `--dp-*` theme tokens themselves live in `public/var.css`
  so every picker instance is themed regardless of which one is mounted.
-->
<style lang="sass">
.noo-date-input__menu
  box-shadow: var(--block-shadow)
</style>
