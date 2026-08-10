<template>
  <noo-search-view
    v-model:page="search.page.value"
    v-model:search="search.search.value"
    :columns="columns"
    :row-link="
      (participation) => ({
        name: 'polls.participation',
        params: {
          pollId: participation.pollId,
          participationId: participation.id
        }
      })
    "
    :is-loading="search.isLoading.value"
    :items="search.data.value"
    :total-count="search.total.value"
    :error="search.error.value"
    :try-again="search.reload"
  >
    <template #column-title="{ item }">
      <noo-text-block class="poll-participations-list__cell">
        {{ item.poll?.title ?? 'Опрос' }}
      </noo-text-block>
    </template>
    <template #column-isActive="{ item }">
      <noo-active-tag :active="item.poll?.isActive ?? false" />
    </template>
    <template #column-createdAt="{ item }">
      <noo-text-block
        class="poll-participations-list__cell"
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
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { useSearch } from '@/core/composables/useSearch'
import { watch } from 'vue'
import { PollService } from '../api/poll.service'
import type { PollParticipationEntity } from '../api/poll.types'

interface Props {
  /** The user whose participations are listed. */
  userId?: string
}

const props = defineProps<Props>()

const search = useSearch<PollParticipationEntity>(
  (pagination) => PollService.getUserParticipations(props.userId!, pagination),
  { immediate: false }
)

// The poll is what the reader recognises, so it leads the row; the participation
// contributes the date it was filled in.
const columns: EntityTableColumnType<PollParticipationEntity>[] = [
  {
    key: 'title',
    title: 'Название'
  },
  {
    key: 'isActive',
    title: 'Статус'
  },
  {
    key: 'createdAt',
    title: 'Дата прохождения'
  }
]

watch(
  () => props.userId,
  (userId) => {
    if (userId) {
      search.reload()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="sass">
.poll-participations-list
  &__cell
    margin: 0
</style>
