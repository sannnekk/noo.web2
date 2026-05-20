<template>
  <noo-base-modal
    v-model:is-open="openModel"
    :close-on-outside-click="!isLoading"
    :close-on-esc="!isLoading"
  >
    <template #title>
      <noo-title :size="2">Новая интеграция с Google Sheets</noo-title>
    </template>
    <template #content>
      <div class="google-sheets-create-modal__form">
        <noo-text-input
          v-model="form.name"
          label="Название"
          placeholder="Например: Экспорт студентов курса"
          :validators="[validateName]"
        />
        <noo-select-input
          v-model="form.type"
          label="Тип данных"
          :options="googleSheetsIntegrationTypes"
        />
        <noo-text-input
          v-model="form.selectorValue"
          label="Идентификатор источника"
          :placeholder="selectorPlaceholder"
        >
          <template #tooltip>
            {{ selectorTooltip }}
          </template>
        </noo-text-input>
        <noo-text-input
          v-model="form.spreadsheetId"
          label="ID Google-таблицы"
          placeholder="Например: 1A2B3C..."
        >
          <template #tooltip>
            ID можно найти в адресе таблицы между /d/ и /edit
          </template>
        </noo-text-input>
        <noo-text-input
          v-model="form.cronPattern"
          label="Расписание (cron)"
          placeholder="Например: 0 */6 * * *"
          :validators="[validateCron]"
        >
          <template #tooltip>
            Cron-выражение, определяющее частоту обновления данных в таблице
          </template>
        </noo-text-input>
        <noo-warning-block small>
          После создания интеграции потребуется авторизоваться через Google,
          чтобы платформа могла записывать данные в Вашу таблицу
        </noo-warning-block>
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="primary"
        :is-loading="isLoading"
        :disabled="!canSave"
        @click="onSave"
      >
        Создать
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
import { isStringOfLength } from '@/core/validators/string.utils'
import { computed, reactive, watch } from 'vue'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleSheetsIntegrationType
} from '../api/google-sheets.types'
import {
  defaultGoogleSheetsCronPattern,
  googleSheetsIntegrationSelectorMeta,
  googleSheetsIntegrationTypes
} from '../constants'

type Emits = (e: 'create', value: CreateGoogleSheetsIntegrationDto) => void

interface Props {
  isLoading?: boolean
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

interface FormState {
  name: string
  type: GoogleSheetsIntegrationType
  selectorValue: string
  spreadsheetId: string
  cronPattern: string
}

const defaultForm: FormState = {
  name: '',
  type: 'user-course',
  selectorValue: '',
  spreadsheetId: '',
  cronPattern: defaultGoogleSheetsCronPattern
}

const form = reactive<FormState>({ ...defaultForm })

const selectorPlaceholder = computed(
  () => googleSheetsIntegrationSelectorMeta[form.type].placeholder
)
const selectorTooltip = computed(
  () => googleSheetsIntegrationSelectorMeta[form.type].tooltip
)

const isNameValid = computed(() => validateName(form.name) === true)
const isCronValid = computed(() => validateCron(form.cronPattern) === true)
const canSave = computed(
  () => !props.isLoading && isNameValid.value && isCronValid.value
)

watch(openModel, (open) => {
  if (open) {
    Object.assign(form, defaultForm)
  }
})

function validateName(value: string) {
  return isStringOfLength(value, 1, 255)
}

function validateCron(value: string) {
  return isStringOfLength(value, 1, 255)
}

function onSave(): void {
  if (!canSave.value) {
    return
  }

  const dto: CreateGoogleSheetsIntegrationDto = {
    name: form.name.trim(),
    type: form.type,
    selectorValue: form.selectorValue.trim() || null,
    spreadsheetId: form.spreadsheetId.trim() || null,
    cronPattern: form.cronPattern.trim()
  }

  emits('create', dto)
}
</script>

<style lang="sass" scoped>
.google-sheets-create-modal__form
  display: flex
  flex-direction: column
  gap: 1em
</style>
