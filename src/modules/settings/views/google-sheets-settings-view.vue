<template>
  <div class="google-sheets-settings-view">
    <noo-section
      title="Интеграции с Google Sheets"
      description="Здесь Вы можете настроить интеграцию с Google Sheets и Google Drive для экспорта данных из системы в таблицы. Вы сможете выбрать, какие данные экспортировать, и как часто обновлять эти данные в таблицах. Для настройки интеграции потребуется авторизоваться через Google"
    >
      <noo-search-view
        v-model:search="store.search.search"
        v-model:page="store.search.page"
        :columns="columns"
        :items="store.search.data"
        :total-count="store.search.total"
        :is-loading="store.search.isLoading"
        :error="store.search.error"
        :try-again="store.search.reload"
      >
        <template #actions>
          <noo-button
            variant="primary"
            @click="isCreateOpen = true"
          >
            Добавить интеграцию
          </noo-button>
        </template>
        <template #column-name="{ item }">
          <noo-text-block no-margin>
            {{ item.name }}
          </noo-text-block>
        </template>
        <template #column-type="{ item }">
          <noo-text-block
            no-margin
            dimmed
          >
            {{ googleSheetsIntegrationTypeLabels[item.type] }}
          </noo-text-block>
        </template>
        <template #column-status="{ item }">
          <noo-text-block
            no-margin
            :class="`google-sheets-settings-view__status google-sheets-settings-view__status--${item.status}`"
          >
            {{ googleSheetsIntegrationStatusLabels[item.status] }}
          </noo-text-block>
        </template>
        <template #column-lastRunAt="{ item }">
          <noo-date
            v-if="item.lastRunAt"
            :value="item.lastRunAt"
            include-time
          />
          <noo-text-block
            v-else
            no-margin
            dimmed
            size="small"
          >
            ещё не запускалась
          </noo-text-block>
        </template>
        <template #column-googleAccount="{ item }">
          <noo-text-block
            no-margin
            dimmed
          >
            {{ item.googleAccount }}
          </noo-text-block>
        </template>
        <template #column-actions="{ item }">
          <div class="google-sheets-settings-view__row-actions">
            <noo-button
              size="small"
              variant="inline"
              :disabled="isRowBusy(item.id)"
              :is-loading="isRunning(item.id)"
              @click="onRun(item.id)"
            >
              Запустить
            </noo-button>
            <noo-button
              size="small"
              variant="danger-inline"
              :disabled="isRowBusy(item.id)"
              :is-loading="isDeleting(item.id)"
              @click="askDelete(item.id)"
            >
              Удалить
            </noo-button>
          </div>
        </template>
      </noo-search-view>
    </noo-section>
  </div>

  <google-sheets-create-modal
    v-model:is-open="isCreateOpen"
    :is-loading="store.create.isLoading"
    @create="onCreate"
  />

  <noo-sure-modal
    v-model:is-open="isDeleteOpen"
    @confirm="confirmDelete"
    @cancel="pendingDeleteId = null"
  >
    <template #title>
      <noo-title :size="2">Удалить интеграцию?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Интеграция будет удалена безвозвратно. Данные, ранее выгруженные в
        Google Sheets, останутся в таблице.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Удалить</template>
  </noo-sure-modal>
</template>

<script lang="ts" setup>
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { shallowRef, watch } from 'vue'
import GoogleSheetsCreateModal from '../components/google-sheets-create-modal.vue'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleSheetsIntegrationEntity
} from '../api/google-sheets.types'
import {
  googleSheetsIntegrationStatusLabels,
  googleSheetsIntegrationTypeLabels
} from '../constants'
import { useGoogleSheetsSettingsStore } from '../stores/google-sheets-settings.store'

const store = useGoogleSheetsSettingsStore()

const isCreateOpen = shallowRef(false)
const isDeleteOpen = shallowRef(false)
const pendingDeleteId = shallowRef<string | null>(null)
const runningId = shallowRef<string | null>(null)

const columns: EntityTableColumnType<GoogleSheetsIntegrationEntity>[] = [
  { key: 'name', title: 'Название' },
  { key: 'type', title: 'Тип' },
  { key: 'status', title: 'Статус' },
  { key: 'lastRunAt', title: 'Последний экспорт' },
  { key: 'googleAccount', title: 'Google-аккаунт' },
  { key: 'actions', title: '', width: '180px', disableLink: true }
]

function isDeleting(id: string): boolean {
  return store.remove.isLoading && pendingDeleteId.value === id
}

function isRunning(id: string): boolean {
  return store.run.isLoading && runningId.value === id
}

function isRowBusy(id: string): boolean {
  return isDeleting(id) || isRunning(id)
}

async function onCreate(dto: CreateGoogleSheetsIntegrationDto): Promise<void> {
  await store.create.execute(dto)

  if (!store.create.error) {
    isCreateOpen.value = false
  }
}

function onRun(id: string): void {
  runningId.value = id
  store.run.execute(id)
}

function askDelete(id: string): void {
  pendingDeleteId.value = id
  isDeleteOpen.value = true
}

function confirmDelete(): void {
  if (!pendingDeleteId.value) {
    return
  }

  store.remove.execute(pendingDeleteId.value)
}

watch(
  () => store.remove.isLoading,
  (loading) => {
    if (!loading && pendingDeleteId.value && !store.remove.error) {
      pendingDeleteId.value = null
    }
  }
)

watch(
  () => store.run.isLoading,
  (loading) => {
    if (!loading && runningId.value && !store.run.error) {
      runningId.value = null
    }
  }
)
</script>

<style lang="sass" scoped>
.google-sheets-settings-view
  &__row-actions
    display: flex
    flex-wrap: wrap
    gap: 0.25em
    justify-content: flex-end

  &__status
    text-transform: lowercase

    &--active
      color: var(--success-color, var(--text-color))

    &--error
      color: var(--danger-color, var(--text-color))

    &--inactive
      color: var(--text-light)
</style>
