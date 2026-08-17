<template>
  <noo-base-modal
    v-model:is-open="openModel"
    :close-on-outside-click="!isBusy"
    :close-on-esc="!isBusy"
  >
    <template #title>
      <noo-title :size="2">Новая выгрузка в Google Sheets</noo-title>
    </template>
    <template #content>
      <div class="google-sheets-create-modal__form">
        <noo-text-input
          v-model="form.name"
          label="Название"
          placeholder="Например: Ученики курса «Химия»"
          :validators="[validateName]"
        />

        <noo-select-input
          v-model="form.type"
          label="Что выгружать"
          :options="typeOptions"
        />
        <noo-text-block
          v-if="typeDescription"
          no-margin
          dimmed
          size="small"
        >
          {{ typeDescription }}
        </noo-text-block>

        <template v-if="form.type === 'users'">
          <noo-select-input
            v-model="form.role"
            label="Роль"
            :options="roleOptions"
          />
          <noo-course-select
            v-model:ids="form.courseId"
            label="Курс"
            placeholder="Любой курс"
          />
          <div class="google-sheets-create-modal__range">
            <noo-date-input
              v-model="form.createdFrom"
              label="Зарегистрирован с"
              type="date"
              resettable
            />
            <noo-date-input
              v-model="form.createdTo"
              label="по"
              type="date"
              resettable
            />
          </div>
        </template>

        <template v-else-if="form.type === 'courses'">
          <noo-subject-select
            v-model:subject-id="form.subjectId"
            label="Предмет"
          />
          <div class="google-sheets-create-modal__range">
            <noo-date-input
              v-model="form.createdFrom"
              label="Создан с"
              type="date"
              resettable
            />
            <noo-date-input
              v-model="form.createdTo"
              label="по"
              type="date"
              resettable
            />
          </div>
        </template>

        <template v-else-if="form.type === 'poll-results'">
          <noo-poll-select
            v-model:ids="form.pollId"
            label="Опрос"
          />
        </template>

        <template v-else-if="form.type === 'assigned-works'">
          <noo-select-input
            v-model="form.assignedWorksScope"
            label="Чьи работы"
            :options="assignedWorksScopeOptions"
          />
          <noo-user-select
            v-if="form.assignedWorksScope === 'student'"
            v-model:ids="form.studentId"
            label="Ученик"
            role="student"
          />
          <noo-user-select
            v-else
            v-model:ids="form.mentorId"
            label="Куратор"
            role="mentor"
            :readonly="isMentor"
          />
        </template>

        <noo-select-input
          v-model="form.schedule"
          label="Обновлять"
          :options="googleSheetsIntegrationSchedules"
        />

        <noo-warning-block
          v-if="validationMessage"
          small
        >
          {{ validationMessage }}
        </noo-warning-block>

        <noo-warning-block
          v-else-if="oauthError"
          small
        >
          {{ oauthError }}
        </noo-warning-block>

        <noo-text-block
          no-margin
          dimmed
          size="small"
        >
          Платформа создаст новую таблицу в Вашем Google Диске и будет обновлять
          её по расписанию. Для этого при создании выгрузки нужно каждый раз
          заново подтвердить доступ в Google.
        </noo-text-block>
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="primary"
        :is-loading="isBusy"
        :disabled="!canSave"
        @click="onSave"
      >
        Подключить Google и создать
      </noo-button>
      <noo-button
        variant="secondary"
        :disabled="isBusy"
        @click="close()"
      >
        Отмена
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import type { UserRole } from '@/core/api/endpoints/auth.types'
import { useAuthStore } from '@/core/stores/auth.store'
import { isStringOfLength } from '@/core/validators/string.utils'
import { computed, reactive, watch } from 'vue'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleSheetsIntegrationSchedule,
  GoogleSheetsIntegrationType
} from '../api/google-sheets.types'
import { useGoogleOAuth } from '../composables/useGoogleOAuth'
import {
  defaultGoogleSheetsSchedule,
  googleSheetsIntegrationSchedules,
  googleSheetsIntegrationTypes
} from '../constants'

type Emits = (e: 'create', value: CreateGoogleSheetsIntegrationDto) => void

interface Props {
  isLoading?: boolean
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

const authStore = useAuthStore()
const { connect, isConnecting, error: oauthError } = useGoogleOAuth()

type AssignedWorksScope = 'student' | 'mentor'

interface FormState {
  name: string
  type: GoogleSheetsIntegrationType
  schedule: GoogleSheetsIntegrationSchedule
  role: UserRole | null
  courseId: string | null
  subjectId: string | null
  createdFrom: Date | null
  createdTo: Date | null
  pollId: string | null
  assignedWorksScope: AssignedWorksScope
  studentId: string | null
  mentorId: string | null
}

const isMentor = computed(() => authStore.roleIsOneOf(['mentor']))

/** Only the exports this role is actually allowed to create. */
const typeOptions = computed(() =>
  googleSheetsIntegrationTypes
    .filter((option) => authStore.roleIsOneOf(option.roles))
    .map((option) => ({ label: option.label, value: option.value }))
)

const typeDescription = computed(
  () =>
    googleSheetsIntegrationTypes.find((option) => option.value === form.type)
      ?.description
)

const roleOptions: { label: string; value: UserRole | null }[] = [
  { label: 'Любая роль', value: null },
  { label: 'Ученики', value: 'student' },
  { label: 'Кураторы', value: 'mentor' },
  { label: 'Преподаватели', value: 'teacher' },
  { label: 'Ассистенты', value: 'assistant' },
  { label: 'Администраторы', value: 'admin' }
]

const assignedWorksScopeOptions: {
  label: string
  value: AssignedWorksScope
}[] = [
  { label: 'Одного ученика', value: 'student' },
  { label: 'Все работы куратора', value: 'mentor' }
]

function buildDefaultForm(): FormState {
  return {
    name: '',
    type: typeOptions.value[0]?.value ?? 'assigned-works',
    schedule: defaultGoogleSheetsSchedule,
    role: null,
    courseId: null,
    subjectId: null,
    createdFrom: null,
    createdTo: null,
    pollId: null,
    assignedWorksScope: 'student',
    studentId: null,
    mentorId: isMentor.value ? (authStore.userId ?? null) : null
  }
}

const form = reactive<FormState>(buildDefaultForm())

const isBusy = computed(() => props.isLoading || isConnecting.value)

/**
 * Mirrors the backend profiles' own validation, so an obviously incomplete
 * form is caught before we make the user sit through a Google consent screen.
 */
const validationMessage = computed(() => {
  if (form.type === 'poll-results' && !form.pollId) {
    return 'Выберите опрос'
  }

  if (form.type === 'assigned-works') {
    if (form.assignedWorksScope === 'student' && !form.studentId) {
      return 'Выберите ученика'
    }

    if (form.assignedWorksScope === 'mentor' && !form.mentorId) {
      return 'Выберите куратора'
    }
  }

  if (form.createdFrom && form.createdTo && form.createdFrom > form.createdTo) {
    return 'Начало периода позже его конца'
  }

  return null
})

const canSave = computed(
  () =>
    !isBusy.value &&
    validateName(form.name) === true &&
    validationMessage.value === null
)

watch(openModel, (open) => {
  if (open) {
    Object.assign(form, buildDefaultForm())
  }
})

// A mentor may only ever export their own workload, so the field is fixed.
watch(
  () => form.assignedWorksScope,
  (scope) => {
    if (scope === 'mentor' && isMentor.value) {
      form.mentorId = authStore.userId ?? null
    }
  }
)

function validateName(value: string) {
  return isStringOfLength(value, 1, 255)
}

function buildParameters(): CreateGoogleSheetsIntegrationDto['parameters'] {
  switch (form.type) {
    case 'users':
      return {
        role: form.role,
        courseId: form.courseId,
        createdFrom: form.createdFrom,
        createdTo: form.createdTo
      }
    case 'courses':
      return {
        subjectId: form.subjectId,
        createdFrom: form.createdFrom,
        createdTo: form.createdTo
      }
    case 'poll-results':
      return { pollId: form.pollId }
    case 'assigned-works':
      return form.assignedWorksScope === 'student'
        ? { studentId: form.studentId }
        : { mentorId: form.mentorId }
  }
}

async function onSave(): Promise<void> {
  if (!canSave.value) {
    return
  }

  // Consent is granted per integration, so this always runs on create and the
  // resulting code is never reused.
  const grant = await connect()

  if (!grant) {
    return
  }

  emits('create', {
    name: form.name.trim(),
    type: form.type,
    parameters: buildParameters(),
    schedule: form.schedule,
    googleAuthCode: grant.code,
    googleAuthState: grant.state
  })
}
</script>

<style lang="sass" scoped>
.google-sheets-create-modal
  &__form
    display: flex
    flex-direction: column
    gap: 1em

  &__range
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 0.75em
</style>
