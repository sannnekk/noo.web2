<template>
  <div class="history-view">
    <noo-search-view
      v-model:page="search.page.value"
      :columns="columns"
      :items="search.data.value"
      :total-count="search.total.value"
      :is-loading="search.isLoading.value"
      :error="search.error.value"
      :try-again="search.reload"
      :with-search="false"
    >
      <template #above-content>
        <noo-search-filters v-model:filters="search.filters.value">
          <noo-search-enum-filter
            v-model:filters="search.filters.value"
            filter-key="perspective"
            label="Чьи действия"
            :include-any="false"
            :options="userHistoryPerspectives"
          />
          <noo-search-enum-filter
            v-model:filters="search.filters.value"
            filter-key="type"
            label="Событие"
            multiple
            :options="userHistoryTypes"
          />
          <noo-search-range-filter
            v-model:filters="search.filters.value"
            filter-key="createdAt"
            from-label="Дата с"
            to-label="до"
          />
        </noo-search-filters>
      </template>
      <template #column-type="{ item }">
        <noo-text-block no-margin>
          {{ userHistoryTypeLabels.get(item.type) ?? item.type }}
        </noo-text-block>
      </template>
      <template #column-createdAt="{ item }">
        <noo-text-block dimmed>
          <noo-date
            :value="item.createdAt"
            include-time
            timezones="both"
          />
        </noo-text-block>
      </template>
      <template #column-actor="{ item }">
        <noo-inline-user-card
          v-if="item.actor"
          :user="item.actor"
        />
        <noo-text-block
          v-else
          dimmed
          no-margin
        >
          —
        </noo-text-block>
      </template>
      <template #column-details="{ item }">
        <user-history-details :item="item" />
      </template>
    </noo-search-view>
  </div>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { useRoute } from 'vue-router'
import { UserHistoryService } from '../api/user-history.service'
import type { UserHistoryEntity } from '../api/user-history.types'
import {
  userHistoryPerspectives,
  userHistoryTypeLabels,
  userHistoryTypes
} from '../constants'
import UserHistoryDetails from '../components/user-history-details.vue'

// Taken from the route rather than the detail store: loadUserGuard kicks off
// init() without awaiting it, so the store can still be empty when this tab mounts.
const route = useRoute()

const search = useSearch<UserHistoryEntity>((pagination) =>
  UserHistoryService.get(String(route.params.userId), pagination)
)

// Seeded rather than left empty so the perspective select opens on a real choice
// instead of "any" — the backend defaults to the same value.
search.filters.value = [new EqualsFilter('perspective', 'subject')]

const columns: EntityTableColumnType<UserHistoryEntity>[] = [
  {
    key: 'type',
    title: 'Событие'
  },
  {
    key: 'createdAt',
    title: 'Когда'
  },
  {
    key: 'actor',
    title: 'Кем'
  },
  {
    key: 'details',
    title: 'Детали'
  }
]
</script>

<style scoped lang="sass">
.history-view
  padding: 0.5em 0
</style>
