<template>
  <div class="poll-results-page">
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
          class="poll-results-page__user-cell"
        >
          {{ item.userExternalIdentifier ?? 'Аноним' }}
        </noo-text-block>
      </template>
      <template #column-userType="{ item }">
        <noo-text-block
          class="poll-results-page__type-cell"
          dimmed
        >
          {{ userTypeLabel(item.userType) }}
        </noo-text-block>
      </template>
      <template #column-createdAt="{ item }">
        <noo-text-block
          class="poll-results-page__created-at-cell"
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
import { useSearch } from '@/core/composables/useSearch'
import { PollService } from '../api/poll.service'
import type {
  ParticipatingUserType,
  PollParticipationEntity
} from '../api/poll.types'
import { participatingUserTypes } from '../constants'

export interface PollResultsPageProps {
  pollId: string
}

const props = defineProps<PollResultsPageProps>()

function userTypeLabel(type: ParticipatingUserType): string {
  return participatingUserTypes.find((t) => t.value === type)?.label ?? type
}

const search = useSearch((pagination) =>
  PollService.getParticipations(props.pollId, pagination)
)

const columns: EntityTableColumnType<PollParticipationEntity>[] = [
  {
    key: 'user',
    title: 'Участник'
  },
  {
    key: 'userType',
    title: 'Тип'
  },
  {
    key: 'createdAt',
    title: 'Дата прохождения'
  }
]
</script>

<style scoped lang="sass">
.poll-results-page
  padding: 0.5em 0

  &__type-cell,
  &__created-at-cell
    margin: 0
</style>
