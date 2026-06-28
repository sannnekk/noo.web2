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
      :error="search.error.value"
      :try-again="search.reload"
      :actions="actions"
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
      <template #column-isActive="{ item }">
        <noo-active-tag :active="item.isActive" />
      </template>
      <template #column-createdAt="{ item }">
        <noo-text-block
          class="polls-list-page__created-at-cell"
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

    <noo-sure-modal
      v-model:is-open="isDeleteOpen"
      @confirm="onConfirmDelete"
    >
      <template #title>
        <noo-title :size="2"> Удалить опрос? </noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Опрос «{{ deletedPoll?.title }}» и все его результаты будут удалены
          безвозвратно.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Удалить </template>
    </noo-sure-modal>
  </div>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { RowAction } from '@/components/entity-table/noo-entity-table.vue'
import { isApiError } from '@/core/api/api.utils'
import { useSearch } from '@/core/composables/useSearch'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PollService } from '../api/poll.service'
import type { PollEntity } from '../api/poll.types'
import { PollsPermissions, usePollsPermissions } from '../permissions'

const router = useRouter()
const uiStore = useGlobalUIStore()
const { can } = usePollsPermissions()

const search = useSearch(PollService.get)

const isDeleteOpen = ref(false)
const deletedPoll = ref<PollEntity | null>(null)

const columns: EntityTableColumnType<PollEntity>[] = [
  {
    key: 'title',
    title: 'Название'
  },
  {
    key: 'participationsCount',
    title: 'Прошло опрос'
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

const actions: RowAction<PollEntity>[] = []

if (can(PollsPermissions.viewResultsPage)) {
  actions.push({
    label: 'Результаты',
    icon: 'list',
    action: (poll) => {
      router.push({ name: 'polls.results', params: { pollId: poll.id } })
    }
  })
}

if (can(PollsPermissions.deletePoll)) {
  actions.push({
    label: 'Удалить',
    icon: 'delete',
    variant: 'danger',
    action: (poll) => openDeleteModal(poll)
  })
}

function openDeleteModal(poll: PollEntity) {
  deletedPoll.value = poll
  isDeleteOpen.value = true
}

async function onConfirmDelete() {
  const poll = deletedPoll.value

  if (!poll) {
    return
  }

  const response = await PollService.delete(poll.id)

  if (isApiError(response)) {
    uiStore.createApiErrorToast('Не удалось удалить опрос', response.error)

    return
  }

  uiStore.createSuccessToast('Опрос удалён')
  search.reload()
}
</script>

<style scoped lang="sass">
.polls-list-page
  padding: 0.5em 0

  &__title-cell
    margin: 0
</style>
