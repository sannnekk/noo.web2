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
      <div class="assign-mentor-modal__form">
        <noo-text-block
          dimmed
          size="small"
        >
          {{ description }}
        </noo-text-block>
        <noo-user-select
          v-if="action?.kind !== 'become'"
          v-model="pickedMentor"
          role="mentor"
          label="Куратор"
          placeholder="Начните вводить имя, email или никнейм куратора"
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
        <noo-subject-select
          v-model:subject-id="subjectIdModel"
          :readonly="action?.kind === 'change'"
        />
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
import { useAuthStore } from '@/core/stores/auth.store'
import type {
  CreateMentorAssignmentPayload,
  MentorAssignmentEntity,
  UserEntity
} from '../api/user.types'

export type AssignMentorAction =
  | { kind: 'add'; student: UserEntity }
  | { kind: 'change'; student: UserEntity; replacing: MentorAssignmentEntity }
  | { kind: 'become'; student: UserEntity }

interface Props {
  action: AssignMentorAction | null
  isLoading?: boolean
}

type Emits = (e: 'submit', payload: CreateMentorAssignmentPayload) => void

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

const authStore = useAuthStore()

const pickedMentor = shallowRef<UserEntity | null>(null)
const subjectIdModel = shallowRef<string | null>(null)

watch(
  () => [openModel.value, props.action] as const,
  ([isOpen, action]) => {
    if (!isOpen) {
      return
    }

    pickedMentor.value = null
    subjectIdModel.value =
      action?.kind === 'change' ? action.replacing.subjectId : null
  },
  { immediate: true }
)

const title = computed<string>(() => {
  switch (props.action?.kind) {
    case 'add':
      return 'Назначить куратора'
    case 'change':
      return 'Сменить куратора'
    case 'become':
      return 'Стать куратором этого ученика'
    default:
      return ''
  }
})

const description = computed<string>(() => {
  switch (props.action?.kind) {
    case 'add':
      return 'Выберите куратора и предмет. Если по выбранному предмету уже есть куратор, он будет заменён.'
    case 'change':
      return 'Выберите нового куратора. Текущий куратор по предмету будет заменён.'
    case 'become':
      return 'Выберите предмет, по которому вы будете курировать этого ученика. Если по этому предмету уже есть куратор, он будет заменён.'
    default:
      return ''
  }
})

const submitLabel = computed<string>(() => {
  switch (props.action?.kind) {
    case 'change':
      return 'Сменить'
    case 'become':
      return 'Стать куратором'
    default:
      return 'Назначить'
  }
})

const resolvedPayload = computed<CreateMentorAssignmentPayload | null>(() => {
  const action = props.action
  const subjectId = subjectIdModel.value

  if (!action || !subjectId) {
    return null
  }

  const mentorId =
    action.kind === 'become'
      ? (authStore.userId ?? null)
      : (pickedMentor.value?.id ?? null)

  if (!mentorId) {
    return null
  }

  return { studentId: action.student.id, mentorId, subjectId }
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
.assign-mentor-modal
  &__form
    display: flex
    flex-direction: column
    gap: 1em
</style>
