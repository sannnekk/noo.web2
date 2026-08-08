<template>
  <noo-base-modal v-model:is-open="isOpen">
    <template #title>
      <noo-title :size="2"> Начать квиз </noo-title>
    </template>
    <template #content>
      <div
        v-if="subjects.isLoading.value"
        class="quiz-start-modal__loading"
      >
        <noo-loader-icon contrast />
      </div>

      <noo-error-block
        v-else-if="subjects.error.value"
        :try-again="() => subjects.execute()"
      >
        <noo-title :size="4"> Не удалось загрузить предметы </noo-title>
      </noo-error-block>

      <div
        v-else
        class="quiz-start-modal__form"
      >
        <noo-text-block
          dimmed
          size="small"
        >
          Карточки для квиза выбираются случайно. Нужно минимум
          {{ MIN_QUIZ_CARD_COUNT }}
          {{
            pluralize(MIN_QUIZ_CARD_COUNT, ['карточка', 'карточки', 'карточек'])
          }}
          по выбранному предмету.
        </noo-text-block>

        <noo-select-input
          v-model="subjectId"
          label="Предмет"
          :options="subjectOptions"
        />

        <noo-number-input
          v-model="count"
          label="Количество карточек"
          :min="MIN_QUIZ_CARD_COUNT"
          :max="maxCount"
          :step="1"
        />

        <noo-warning-block v-if="hasTooFewCards">
          По выбранному предмету
          {{ availableCount }}
          {{ pluralize(availableCount, ['карточка', 'карточки', 'карточек']) }}.
          Сохраните ещё несколько заданий из проверенных работ, чтобы начать
          квиз.
        </noo-warning-block>
        <noo-text-block
          v-else
          size="small"
          dimmed
        >
          Доступно {{ availableCount }}
          {{ pluralize(availableCount, ['карточка', 'карточки', 'карточек']) }}.
        </noo-text-block>
      </div>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="isOpen = false"
      >
        Отмена
      </noo-button>
      <noo-button
        :disabled="!canStart"
        @click="startQuiz"
      >
        Начать
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { pluralize } from '@/core/utils/lang.utils'
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SavedTaskService } from '../api/saved-task.service'
import type { SavedTaskSubjectSummary } from '../api/saved-task.types'
import { MIN_QUIZ_CARD_COUNT, DEFAULT_QUIZ_CARD_COUNT } from '../constants'

const isOpen = defineModel<boolean>('isOpen', { default: false })

const router = useRouter()

// `null` is a real choice here — it means every subject — so the select uses it
// as the value of its first option rather than as "nothing picked".
const subjectId = defineModel<string | null>('subjectId', { default: null })
const count = defineModel<number>('count', { default: DEFAULT_QUIZ_CARD_COUNT })

const subjects = useApiRequest<void, SavedTaskSubjectSummary[]>(
  SavedTaskService.getSubjects,
  undefined,
  undefined,
  { trackProgress: false }
)

const summaries = computed<SavedTaskSubjectSummary[]>(
  () => subjects.data.value ?? []
)

const totalCount = computed(() =>
  summaries.value.reduce((total, summary) => total + summary.savedTaskCount, 0)
)

const subjectOptions = computed(() => [
  { label: `Все предметы (${totalCount.value})`, value: null },
  ...summaries.value.map((summary) => ({
    label: `${summary.subject?.name ?? 'Без предмета'} (${summary.savedTaskCount})`,
    value: summary.subject?.id ?? null
  }))
])

const availableCount = computed(() => {
  if (subjectId.value === null) {
    return totalCount.value
  }

  return (
    summaries.value.find((summary) => summary.subject?.id === subjectId.value)
      ?.savedTaskCount ?? 0
  )
})

const hasTooFewCards = computed(
  () => availableCount.value < MIN_QUIZ_CARD_COUNT
)

const maxCount = computed(() =>
  Math.max(availableCount.value, MIN_QUIZ_CARD_COUNT)
)

const canStart = computed(() => !hasTooFewCards.value && count.value > 0)

// Asking for more cards than the chosen subject holds would only be trimmed
// server-side; showing the trimmed number keeps the form honest.
watch([availableCount, isOpen], () => {
  count.value = Math.min(
    Math.max(count.value, MIN_QUIZ_CARD_COUNT),
    maxCount.value
  )
})

watch(isOpen, (open) => {
  if (open) {
    subjects.execute()
  }
})

function startQuiz() {
  if (!canStart.value) {
    return
  }

  isOpen.value = false

  router.push({
    name: 'task-cards.quiz',
    query: {
      count: String(count.value),
      ...(subjectId.value ? { subjectId: subjectId.value } : {})
    }
  })
}
</script>

<style scoped lang="sass">
.quiz-start-modal
  &__loading
    display: flex
    align-items: center
    justify-content: center
    padding: var(--space-l)
    font-size: 2rem

  &__form
    display: flex
    flex-direction: column
    gap: var(--space-2xs)
</style>
