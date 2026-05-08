<template>
  <noo-base-modal
    v-model:is-open="openModel"
    :close-on-outside-click="!isLoading"
    :close-on-esc="!isLoading"
  >
    <template #title>
      <noo-title :size="2">{{ title }}</noo-title>
    </template>
    <template #content>
      <div class="mentor-assignment-modal__form">
        <noo-text-block
          v-if="description"
          dimmed
          size="small"
        >
          {{ description }}
        </noo-text-block>
        <noo-user-select
          v-if="mode === 'pick-mentor' && !fixedMentorId"
          v-model="mentorModel"
          role="mentor"
          label="Куратор"
          placeholder="Начните вводить имя куратора"
        />
        <noo-user-select
          v-else-if="mode === 'pick-student'"
          v-model="studentModel"
          role="student"
          label="Ученик"
          placeholder="Начните вводить имя ученика"
        />
        <noo-subject-select v-model:subject-id="subjectIdModel" />
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="secondary"
        :disabled="isLoading"
        @click="close()"
      >
        Отмена
      </noo-button>
      <noo-button
        variant="primary"
        :disabled="!canSubmit"
        :is-loading="isLoading"
        @click="onSubmit()"
      >
        {{ submitLabel }}
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type {
  CreateMentorAssignmentPayload,
  UserEntity
} from '../api/user.types'

type Mode = 'pick-mentor' | 'pick-student'

interface Props {
  /**
   * 'pick-mentor' — used on a student profile (admin/teacher/self-assign).
   * 'pick-student' — used on a mentor profile to add a student.
   */
  mode: Mode
  /**
   * The user the assignment is anchored to:
   * - In 'pick-mentor' mode this is the student.
   * - In 'pick-student' mode this is the mentor.
   */
  anchorUser: UserEntity
  /**
   * Locks the mentor side to a specific user id. Used for self-assign —
   * the mentor picker is hidden and the given id is always used.
   */
  fixedMentorId?: string | null
  title: string
  description?: string
  submitLabel?: string
  isLoading?: boolean
}

type Emits = (e: 'submit', payload: CreateMentorAssignmentPayload) => void

const props = withDefaults(defineProps<Props>(), {
  fixedMentorId: null,
  description: '',
  submitLabel: 'Назначить',
  isLoading: false
})

const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

const mentorModel = shallowRef<UserEntity | null>(null)
const studentModel = shallowRef<UserEntity | null>(null)
const subjectIdModel = shallowRef<string | null>(null)

watch(openModel, (isOpen) => {
  if (isOpen) {
    mentorModel.value = null
    studentModel.value = null
    subjectIdModel.value = null
  }
})

const resolvedMentorId = computed<string | null>(() => {
  if (props.fixedMentorId) {
    return props.fixedMentorId
  }

  if (props.mode === 'pick-mentor') {
    return mentorModel.value?.id ?? null
  }

  return props.anchorUser.id
})

const resolvedStudentId = computed<string | null>(() => {
  if (props.mode === 'pick-student') {
    return studentModel.value?.id ?? null
  }

  return props.anchorUser.id
})

const canSubmit = computed(
  () =>
    !props.isLoading &&
    !!resolvedMentorId.value &&
    !!resolvedStudentId.value &&
    !!subjectIdModel.value
)

function onSubmit(): void {
  if (
    !resolvedMentorId.value ||
    !resolvedStudentId.value ||
    !subjectIdModel.value
  ) {
    return
  }

  emits('submit', {
    mentorId: resolvedMentorId.value,
    studentId: resolvedStudentId.value,
    subjectId: subjectIdModel.value
  })
}
</script>

<style scoped lang="sass">
.mentor-assignment-modal
  &__form
    display: flex
    flex-direction: column
    gap: 1em
</style>
