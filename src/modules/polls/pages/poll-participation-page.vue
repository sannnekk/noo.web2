<template>
  <div class="poll-participation-page">
    <noo-back-button :route="{ name: 'polls.results', params: { pollId } }">
      Назад к результатам
    </noo-back-button>

    <div
      v-if="isLoading"
      class="poll-participation-page__state"
    >
      <noo-loader-icon contrast />
    </div>

    <noo-error-block
      v-else-if="error"
      with-image
      centered
      :try-again="reload"
    >
      <noo-title :size="3"> Не удалось загрузить ответы </noo-title>
    </noo-error-block>

    <template v-else-if="participation">
      <noo-section
        title="Участник"
        class="poll-participation-page__participant"
      >
        <div class="poll-participation-page__participant__row">
          <noo-inline-user-card
            v-if="participation.user"
            :user="participation.user"
          />
          <noo-text-block
            v-else
            no-margin
          >
            {{ participation.userExternalIdentifier ?? 'Аноним' }}
          </noo-text-block>
          <noo-text-block
            dimmed
            no-margin
          >
            {{ userTypeLabel(participation.userType) }} ·
            <noo-date
              :value="participation.createdAt"
              timezones="both"
              include-time
            />
          </noo-text-block>
        </div>
      </noo-section>

      <noo-section :title="pollTitle">
        <ol class="poll-participation-page__questions">
          <li
            v-for="question in questions"
            :key="question.id"
            class="poll-participation-page__question"
          >
            <noo-title
              :size="5"
              class="poll-participation-page__question__title"
            >
              {{ question.title }}
            </noo-title>
            <poll-answer-value
              v-if="answersByQuestionId[question.id]"
              :answer="answersByQuestionId[question.id]"
            />
            <noo-text-block
              v-else
              dimmed
              no-margin
            >
              Без ответа
            </noo-text-block>
          </li>
        </ol>
      </noo-section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { computed, watch } from 'vue'
import { PollService } from '../api/poll.service'
import type { ParticipatingUserType, PollAnswerEntity } from '../api/poll.types'
import { participatingUserTypes } from '../constants'
import pollAnswerValue from '../views/poll-answer-value.vue'

export interface PollParticipationPageProps {
  pollId: string
  participationId: string
}

const props = defineProps<PollParticipationPageProps>()

const poll = useApiRequest(PollService.getById)
const participationRequest = useApiRequest(PollService.getParticipation)

const participation = computed(() => participationRequest.data.value)
const pollTitle = computed(() => poll.data.value?.title ?? 'Ответы')
const questions = computed(() => poll.data.value?.questions ?? [])

const answersByQuestionId = computed<Record<string, PollAnswerEntity>>(() => {
  const map: Record<string, PollAnswerEntity> = {}

  for (const answer of participation.value?.answers ?? []) {
    map[answer.pollQuestionId] = answer
  }

  return map
})

const isLoading = computed(
  () => poll.isLoading.value || participationRequest.isLoading.value
)
const error = computed(
  () => poll.error.value ?? participationRequest.error.value
)

function userTypeLabel(type: ParticipatingUserType): string {
  return participatingUserTypes.find((t) => t.value === type)?.label ?? type
}

function reload() {
  poll.execute(props.pollId)
  participationRequest.execute(props.participationId)
}

watch(
  () => [props.pollId, props.participationId],
  () => reload(),
  { immediate: true }
)
</script>

<style scoped lang="sass">
.poll-participation-page
  padding: 0.5em 0

  &__state
    display: flex
    justify-content: center
    padding: 3em 0
    font-size: 4em

  &__participant
    margin-bottom: 1.5em

    &__row
      display: flex
      flex-direction: column
      gap: 0.25em

  &__questions
    margin: 0
    padding: 0
    list-style: none
    display: flex
    flex-direction: column
    gap: 1.25em

  &__question
    &__title
      margin-bottom: 0.35em
</style>
