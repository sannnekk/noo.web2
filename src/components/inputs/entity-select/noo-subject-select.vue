<template>
  <div class="noo-subject-select">
    <div
      v-if="state === 'loaded'"
      class="noo-subject-select__content"
    >
      <noo-select-input
        v-model="idModel"
        :label="label"
        :options="subjectOptions"
        :errors="errors"
      />
    </div>
    <div
      v-else-if="state === 'loading'"
      class="noo-subject-select__loading"
    >
      <noo-input-skeleton />
    </div>
    <div
      v-else-if="state === 'empty'"
      class="noo-subject-select__empty"
    >
      <p>
        Список предметов пуст. Обратитесь к администратору для добавления
        предметов.
      </p>
    </div>
    <div
      v-else
      class="noo-subject-select__error"
    >
      <p>
        Не удалось загрузить список предметов.
        <span
          class="noo-subject-select__error__retry"
          @click="loadSubjects"
        >
          Повторить
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { SubjectService } from '@/modules/subjects/api/subject.service'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import { computed, onMounted, shallowRef, watchEffect } from 'vue'

interface Props {
  label?: string
  errors?: ValidationError[]
}

withDefaults(defineProps<Props>(), {
  label: 'Выберите предмет'
})

const entityModel = defineModel<SubjectEntity | null>('subject', {
  default: null
})

const idModel = defineModel<string | null>('subjectId', {
  default: null
})

const state = shallowRef<'loading' | 'loaded' | 'error' | 'empty'>('loading')

const subjects = shallowRef<SubjectEntity[]>([])

const subjectOptions = computed(() =>
  subjects.value.map((subject) => ({
    label: subject.name,
    value: subject.id
  }))
)

watchEffect(() => {
  if (idModel.value) {
    const subject = subjects.value.find(
      (subject) => subject.id === idModel.value
    )

    entityModel.value = subject ?? null
  } else {
    entityModel.value = null
  }
})

onMounted(loadSubjects)

async function loadSubjects() {
  state.value = 'loading'

  const response = await SubjectService.get()

  if (response.data?.length) {
    subjects.value = response.data
    state.value = 'loaded'
  } else if (response.error) {
    state.value = 'error'
  } else {
    state.value = 'empty'
  }
}
</script>

<style lang="sass" scoped>
.noo-subject-select
  &__loading
    height: 3em
    margin-bottom: 0.7em

  &__error
    color: var(--danger)
    font-size: 0.8em
    line-height: 1.1em

    &__retry
      text-decoration: underline
      cursor: pointer

      &:hover
        color: var(--text-light)

  &__empty
    color: var(--text-light)
    font-size: 0.8em
    line-height: 1.1em
</style>
