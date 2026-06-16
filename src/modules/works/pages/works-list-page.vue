<template>
  <div class="works-list-page">
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :is-loading="search.isLoading.value"
      :items="search.data.value"
      :total-count="search.total.value"
      :row-link="
        (item) => ({
          name: 'works.edit',
          params: { workId: item.id }
        })
      "
      :error="search.error.value"
      :try-again="search.reload"
      :actions="actions"
    >
      <template #above-content>
        <noo-search-filters v-model:filters="search.filters.value">
          <noo-search-range-filter
            v-model:filters="search.filters.value"
            filter-key="createdAt"
            from-label="Дата создания с"
            to-label="до"
          />
          <noo-search-subject-filter
            v-model:filters="search.filters.value"
            filter-key="subjectId"
          />
          <noo-search-enum-filter
            v-model:filters="search.filters.value"
            filter-key="type"
            label="Тип"
            multiple
            :options="workTypes"
          />
        </noo-search-filters>
      </template>
      <template #actions>
        <noo-button
          :to="{ name: 'works.edit' }"
          variant="primary"
        >
          Создать работу
        </noo-button>
      </template>
      <template #column-title="{ item }">
        <noo-text-block class="works-list-page__name">
          {{ item.title }}
        </noo-text-block>
      </template>
      <template #column-type="{ item }">
        <noo-work-type-tag :type="item.type" />
      </template>
      <template #column-subject="{ item }">
        <noo-subject-block :subject="item.subject ?? null" />
      </template>
      <template #column-createdAt="{ item }">
        <noo-text-block
          dimmed
          class="works-list-page__created-at"
          align="right"
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

  <work-statistics-modal
    v-model:is-open="statisticsModal.isOpen"
    :work-id="statisticsModal.workId"
  />

  <noo-sure-modal
    v-model:is-open="deleteModal.isOpen"
    @confirm="onConfirmDelete"
  >
    <template #title>
      <noo-title :size="2"> Удалить работу </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Вы уверены, что хотите удалить работу «{{ deleteModal.work?.title }}»?
        Это действие необратимо.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Удалить </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import WorkStatisticsModal from '../components/work-statistics-modal.vue'
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { RowAction } from '@/components/entity-table/noo-entity-table.vue'
import { useSearch } from '@/core/composables/useSearch'
import { isApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { WorkService } from '../api/work.service'
import type { WorkEntity } from '../api/work.types'
import { workTypes } from '../constants'
import { reactive } from 'vue'

const search = useSearch<WorkEntity>(WorkService.get)
const uiStore = useGlobalUIStore()

const statisticsModal = reactive({
  isOpen: false,
  workId: null as WorkEntity['id'] | null
})

const deleteModal = reactive({
  isOpen: false,
  work: null as WorkEntity | null
})

const columns: EntityTableColumnType<WorkEntity>[] = [
  {
    key: 'title',
    title: 'Название'
  },
  {
    key: 'type',
    title: 'Тип'
  },
  {
    key: 'subject',
    title: 'Предмет'
  },
  {
    key: 'createdAt',
    title: 'Дата создания'
  }
]

const actions: RowAction<WorkEntity>[] = [
  {
    icon: 'statistics',
    label: 'Статистика работы',
    action: (work) => {
      statisticsModal.workId = work.id
      statisticsModal.isOpen = true
    }
  },
  {
    icon: 'delete',
    label: 'Удалить работу',
    variant: 'danger',
    action: (work) => {
      deleteModal.work = work
      deleteModal.isOpen = true
    }
  }
]

async function onConfirmDelete(): Promise<void> {
  const work = deleteModal.work

  if (!work) {
    return
  }

  const response = await WorkService.delete(work.id)

  if (isApiError(response)) {
    uiStore.createApiErrorToast('Не удалось удалить работу', response.error)

    return
  }

  deleteModal.work = null
  uiStore.createSuccessToast('Работа удалена')
  await search.reload()
}
</script>

<style lang="sass" scoped>
.works-list-page
  padding: 0.5em 0

  &__name
    margin: 0

  &__created-at
    margin: 0
</style>
