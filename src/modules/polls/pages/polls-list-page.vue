<template>
  <div class="polls-list-page">
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :row-link="
        (poll) => ({
          name: 'polls.edit',
          params: { pollId: poll.id }
        })
      "
      :is-loading="search.isLoading.value"
      :items="search.data.value"
      :total-count="search.total.value"
    >
      <template #actions>
        <noo-button
          :to="{ name: 'polls.edit' }"
          variant="primary"
        >
          Создать опрос
        </noo-button>
      </template>
      <template #column-title="{ item }">
        <noo-text-block class="polls-list-page__title-cell">
          {{ item.title }}
        </noo-text-block>
      </template>
      <template #column-is-active="{ item }">
        <noo-active-tag :active="item.isActive" />
      </template>
      <template #column-created-at="{ item }">
        <noo-text-block
          class="polls-list-page__created-at-cell"
          dimmed
        >
          <noo-date
            :value="item.createdAt"
            timezones="both"
            include-time
          />
          <br />
          <noo-date
            :value="item.updatedAt"
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
import type { PollEntity } from '../api/poll.types'

const search = useSearch(PollService.get)

const columns: EntityTableColumnType<PollEntity>[] = [
  {
    key: 'title',
    title: 'Название'
  },
  {
    key: 'is-active',
    title: 'Статус'
  },
  {
    key: 'created-at',
    title: 'Дата создания/обновления'
  }
]
</script>

<style scoped lang="sass">
.polls-list-page
  padding: 0.5em 0

  &__title-cell
    margin: 0
</style>
