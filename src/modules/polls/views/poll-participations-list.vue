<template>
  <noo-search-view
    v-model:page="search.page.value"
    v-model:search="search.search.value"
    :columns="columns"
    :is-loading="search.isLoading.value"
    :items="search.data.value"
    :total-count="search.total.value"
    :error="search.error.value"
    :try-again="search.reload"
  >
    <template #column-title="{ item }">
      <noo-text-block class="poll-participations-list__title-cell">
        {{ item.title }}
      </noo-text-block>
    </template>
    <template #column-isActive="{ item }">
      <noo-active-tag :active="item.isActive" />
    </template>
    <template #column-createdAt="{ item }">
      <noo-text-block
        class="poll-participations-list__created-at-cell"
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
import type { PollEntity } from '../api/poll.types'

interface Props {
  /** The user whose participated polls are listed. */
  userId?: string
}

const props = defineProps<Props>()

const search = useSearch<PollEntity>(
  (pagination) => PollService.getParticipatedPolls(props.userId!, pagination),
  { immediate: false }
)

const columns: EntityTableColumnType<PollEntity>[] = [
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
    title: 'Дата создания'
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
  &__title-cell,
  &__created-at-cell
    margin: 0
</style>
