<template>
  <div class="poll-participation-details-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="poll-participation-details-page__sidebar">
          <noo-back-button :route="backRoute">
            {{ canViewResults ? 'Назад к результатам' : 'Назад в профиль' }}
          </noo-back-button>

          <template v-if="participation">
            <div class="poll-participation-details-page__sidebar__avatar">
              <noo-user-avatar
                :name="participantName"
                :avatar="participation.user?.avatar"
              />
            </div>

            <div class="poll-participation-details-page__sidebar__info">
              <noo-inline-link
                v-if="participation.user"
                size="large"
                :to="{
                  name: 'users.detail',
                  params: { userId: participation.user.id }
                }"
              >
                {{ participation.user.name }}
              </noo-inline-link>
              <noo-title
                v-else
                :size="3"
                no-margin
              >
                {{ participantName }}
              </noo-title>

              <noo-text-block
                size="small"
                dimmed
                no-margin
              >
                <noo-date
                  :value="participation.createdAt"
                  timezones="both"
                  include-time
                />
              </noo-text-block>
            </div>

            <div
              v-if="questions.length"
              class="poll-participation-details-page__sidebar__progress"
            >
              <div
                class="poll-participation-details-page__sidebar__progress__count"
              >
                {{ answeredCount }}
                <span>из {{ questions.length }} отвечено</span>
              </div>
              <noo-progress-bar :value="answeredPercent" />
            </div>
          </template>

          <div
            v-else-if="isLoading"
            class="poll-participation-details-page__sidebar__loading"
          >
            <noo-loader-icon contrast />
            <noo-text-block
              size="small"
              dimmed
            >
              Загрузка ответов...
            </noo-text-block>
          </div>
        </div>
      </template>

      <template #content>
        <div
          v-if="isLoading"
          class="poll-participation-details-page__state"
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

        <noo-section
          v-else-if="participation"
          :title="pollTitle"
          description="Ответы участника на вопросы"
        >
          <div
            v-if="questions.length"
            class="poll-participation-details-page__questions"
          >
            <poll-answer-result-card
              v-for="(question, index) in questions"
              :key="question.id"
              :question="question"
              :index="index"
              :answer="answersByQuestionId[question.id]"
            />
          </div>
          <noo-text-block
            v-else
            dimmed
            no-margin
          >
            В опросе нет вопросов
          </noo-text-block>
        </noo-section>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { useApiRequest } from '@/core/composables/useApiRequest'
import { computed, watch } from 'vue'
import { PollService } from '../api/poll.service'
import type { PollAnswerEntity } from '../api/poll.types'
import pollAnswerResultCard from '../components/poll-answer-result-card.vue'
import { PollsPermissions, usePollsPermissions } from '../permissions'

export interface PollParticipationDetailsPageProps {
  pollId: string
  participationId: string
}

const props = defineProps<PollParticipationDetailsPageProps>()

const { can } = usePollsPermissions()

// Participants reach this page from their profile and cannot open the poll's
// results, so they are sent back where they came from.
const canViewResults = can(PollsPermissions.viewResultsPage)

const backRoute = computed(() =>
  canViewResults
    ? { name: 'polls.results', params: { pollId: props.pollId } }
    : { name: 'profile', query: { tabId: 'polls' } }
)

const poll = useApiRequest(PollService.getById)
const participationRequest = useApiRequest(PollService.getParticipation)

const participation = computed(() => participationRequest.data.value)
const pollTitle = computed(() => poll.data.value?.title ?? 'Ответы')
const questions = computed(() => poll.data.value?.questions ?? [])

const participantName = computed(
  () =>
    participation.value?.user?.name ??
    participation.value?.userExternalIdentifier ??
    'Аноним'
)

const answersByQuestionId = computed<Record<string, PollAnswerEntity>>(() => {
  const map: Record<string, PollAnswerEntity> = {}

  for (const answer of participation.value?.answers ?? []) {
    map[answer.pollQuestionId] = answer
  }

  return map
})

const answeredCount = computed(
  () =>
    questions.value.filter((question) => answersByQuestionId.value[question.id])
      .length
)

const answeredPercent = computed(() =>
  questions.value.length
    ? Math.round((answeredCount.value / questions.value.length) * 100)
    : 0
)

const isLoading = computed(
  () => poll.isLoading.value || participationRequest.isLoading.value
)
const error = computed(
  () => poll.error.value ?? participationRequest.error.value
)

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
.poll-participation-details-page
  &__sidebar
    display: flex
    flex-direction: column
    align-items: center
    gap: 1em
    text-align: center

    &__avatar
      // The participant is context here rather than the subject of the page, so
      // the avatar stays smaller than the one on the user detail page.
      font-size: 140px

    &__info
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.5em

      &__type
        display: inline-flex
        align-items: center
        gap: 0.35em
        font-size: var(--step--1)
        color: var(--text-light)

    &__progress
      width: 100%

      &__count
        font-size: var(--step-2)
        font-weight: 700
        line-height: 1.1
        margin-bottom: var(--space-3xs)

        span
          font-size: var(--step--1)
          font-weight: 400
          color: var(--text-light)

    &__loading
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.5em
      font-size: 2em

  &__state
    display: flex
    justify-content: center
    padding: 3em 0
    font-size: 4em

  &__questions
    display: flex
    flex-direction: column
    gap: var(--space-2xs)
</style>
