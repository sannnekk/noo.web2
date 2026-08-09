<template>
  <div class="poll-results-page">
    <div class="poll-results-page__header">
      <noo-back-button :route="{ name: 'polls.list' }">
        Назад к опросам
      </noo-back-button>

      <noo-title
        :size="2"
        no-margin
      >
        {{ pollRequest.data.value?.title ?? 'Результаты опроса' }}
      </noo-title>

      <noo-text-block
        v-if="pollRequest.data.value?.description"
        dimmed
        no-margin
      >
        {{ pollRequest.data.value.description }}
      </noo-text-block>

      <div
        v-if="pollRequest.data.value"
        class="poll-results-page__header__meta"
      >
        <noo-active-tag :active="pollRequest.data.value.isActive" />
        <noo-dot-separator />
        <span>Участников: {{ search.total.value }}</span>
        <template v-if="pollRequest.data.value.expiresAt">
          <noo-dot-separator />
          <span>
            Завершается
            <noo-date
              :value="pollRequest.data.value.expiresAt"
              timezones="both"
              include-time
            />
          </span>
        </template>
      </div>
    </div>
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :row-link="
        (participation) => ({
          name: 'polls.participation',
          params: { pollId, participationId: participation.id }
        })
      "
      :is-loading="search.isLoading.value"
      :items="search.data.value"
      :total-count="search.total.value"
      :error="search.error.value"
      :try-again="search.reload"
    >
      <template #column-user="{ item }">
        <noo-inline-user-card
          v-if="item.user"
          :user="item.user"
        />
        <noo-text-block
          v-else
          class="poll-results-page__cell"
        >
          {{ item.userExternalIdentifier ?? 'Аноним' }}
        </noo-text-block>
      </template>
      <template #column-email="{ item }">
        <noo-text-block
          class="poll-results-page__cell"
          dimmed
        >
          {{ item.user?.email ?? '—' }}
        </noo-text-block>
      </template>
      <template #column-username="{ item }">
        <noo-text-block
          class="poll-results-page__cell"
          dimmed
        >
          {{ item.user?.username ?? '—' }}
        </noo-text-block>
      </template>
      <template #column-createdAt="{ item }">
        <noo-text-block
          class="poll-results-page__cell"
          dimmed
        >
          <noo-date
            :value="item.createdAt"
            timezones="both"
            include-time
          />
        </noo-text-block>
      </template>
    </noo-search-view>
  </div>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useSearch } from '@/core/composables/useSearch'
import { watch } from 'vue'
import { PollService } from '../api/poll.service'
import type { PollParticipationEntity } from '../api/poll.types'

export interface PollResultsPageProps {
  pollId: string
}

const props = defineProps<PollResultsPageProps>()

const search = useSearch((pagination) =>
  PollService.getParticipations(props.pollId, pagination)
)

const pollRequest = useApiRequest(PollService.getById)

watch(
  () => props.pollId,
  (pollId) => pollRequest.execute(pollId),
  {
    immediate: true
  }
)

// Email and username live on the participant rather than on the participation,
// so they are rendered through slots instead of a key on the entity.
const columns: EntityTableColumnType<PollParticipationEntity>[] = [
  {
    key: 'user',
    title: 'Участник'
  },
  {
    key: 'email',
    title: 'Email'
  },
  {
    key: 'username',
    title: 'Никнейм'
  },
  {
    key: 'createdAt',
    title: 'Дата прохождения'
  }
]
</script>

<style scoped lang="sass">
.poll-results-page
  &__header
    display: flex
    padding: var(--space-xs)
    flex-direction: column
    align-items: flex-start
    gap: var(--space-3xs)
    margin-bottom: var(--space-s)

    &__meta
      display: flex
      align-items: center
      flex-wrap: wrap
      gap: 0.5em
      margin-top: var(--space-3xs)
      font-size: var(--step--1)
      color: var(--text-light)

  &__cell
    margin: 0
</style>
