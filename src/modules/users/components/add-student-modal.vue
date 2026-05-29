<template>
  <noo-base-modal
    v-model:is-open="openModel"
    :close-on-outside-click="!isLoading"
    :close-on-esc="!isLoading"
  >
    <template #title>
      <noo-title :size="2">Добавить ученика</noo-title>
    </template>
    <template #content>
      <div class="add-student-modal__form">
        <noo-text-block
          dimmed
          size="small"
        >
          Выберите ученика и предмет.
        </noo-text-block>
        <noo-user-select
          v-model="pickedStudent"
          role="student"
          label="Ученик"
          placeholder="Начните вводить имя, email или никнейм ученика"
        >
          <template #tags="{ entity }">
            <noo-text-block
              dimmed
              no-margin
              size="small"
              class="noo-user-select__suggestion-title"
            >
              {{ entity.email }}
            </noo-text-block>
          </template>
        </noo-user-select>
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
        Назначить
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

interface Props {
  mentor: UserEntity | null
  isLoading?: boolean
}

type Emits = (e: 'submit', payload: CreateMentorAssignmentPayload) => void

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

const pickedStudent = shallowRef<UserEntity | null>(null)
const subjectIdModel = shallowRef<string | null>(null)

watch(
  openModel,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    pickedStudent.value = null
    subjectIdModel.value = null
  },
  { immediate: true }
)

const resolvedPayload = computed<CreateMentorAssignmentPayload | null>(() => {
  const studentId = pickedStudent.value?.id
  const mentorId = props.mentor?.id
  const subjectId = subjectIdModel.value

  if (!studentId || !mentorId || !subjectId) {
    return null
  }

  return { studentId, mentorId, subjectId }
})

const canSubmit = computed(
  () => !props.isLoading && resolvedPayload.value !== null
)

function onSubmit(): void {
  if (resolvedPayload.value) {
    emits('submit', resolvedPayload.value)
  }
}
</script>

<style scoped lang="sass">
.add-student-modal
  &__form
    display: flex
    flex-direction: column
    gap: 1em
</style>
