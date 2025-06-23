<template>
  <div class="works-list-page">
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :is-loading="search.isLoading.value"
      :items="/* search.data.value */works"
      :total-count="search.total.value"
      :row-link="(item) => ({
        name: 'works.edit',
        params: { workId: item.id }
      })"
    >
      <template #actions>
        <noo-button
          :to="{ name: 'works.edit' }"
          variant="primary"
        >
          Создать работу
        </noo-button>
      </template>
      <template #column-title="{item}">
        <noo-text-block class="works-list-page__name">
          {{ item.title }}
        </noo-text-block>
      </template>
      <template #column-type="{item}">
        <noo-work-type-tag :type="item.type" />
      </template>
      <template #column-subject="{item}">
        <noo-subject-block :subject="item.subject" />
      </template>
      <template #column-createdAt="{item}">
        <noo-text-block
          dimmed
          class="works-list-page__created-at"
        >
          <noo-date
            :value="item.createdAt"
            timezones="both"
            include-time
          />
          <br>
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
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers';
import { useSearch } from '@/core/composables/useSearch';
import { WorkService } from '../api/work.service';
import type { WorkEntity } from '../api/work.types';
import { works } from '../mock-data/works';

const search = useSearch<WorkEntity>(WorkService.get)

const columns: EntityTableColumnType<WorkEntity>[] = [
  {
    key: 'title',
    title: 'Название'
  },
  {
    key: 'type',
    title: 'Тип',
  },
  {
    key: 'subject',
    title: 'Предмет'
  },
  {
    key: 'createdAt',
    title: 'Дата создания'
  },
  {
    key: 'actions',
    title: '',
    disableLink: true,
  }
]
</script>

<style lang="sass" scoped>
.works-list-page
  padding: 0.5em 0

  &__name
    margin: 0

  &__created-at
    margin: 0
</style>
