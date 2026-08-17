<template>
  <div class="google-sheets-settings-view">
    <noo-section
      title="Выгрузки в Google Sheets"
      description="Здесь можно настроить регулярную выгрузку данных платформы в Google-таблицы. Платформа создаст таблицу в Вашем Google Диске и будет обновлять её по расписанию. При создании каждой выгрузки нужно заново подтвердить доступ в Google."
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
        :actions="rowActions"
      >
        <template #actions>
          <noo-button
            variant="primary"
            @click="isCreateOpen = true"
          >
            Добавить выгрузку
          </noo-button>
        </template>
        <template #column-name="{ item }">
          <noo-text-block no-margin>
            {{ item.name }}
          </noo-text-block>
          <noo-inline-link
            v-if="item.spreadsheetUrl"
            :href="item.spreadsheetUrl"
            size="small"
          >
            Открыть таблицу
          </noo-inline-link>
          <noo-text-block
            v-if="item.lastErrorText"
            no-margin
            size="small"
            class="google-sheets-settings-view__error-text"
          >
            {{ item.lastErrorText }}
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
        <template #column-schedule="{ item }">
          <noo-text-block
            no-margin
            dimmed
          >
            {{ googleSheetsIntegrationScheduleLabels[item.schedule] }}
          </noo-text-block>
        </template>
        <template #column-status="{ item }">
          <noo-active-tag :active="item.status === 'active'">
            {{ googleSheetsIntegrationStatusLabels[item.status] }}
          </noo-active-tag>
          <noo-text-block
            v-if="item.runState !== 'idle'"
            no-margin
            size="small"
            dimmed
          >
            {{ googleSheetsIntegrationRunStateLabels[item.runState] }}
          </noo-text-block>
        </template>
        <template #column-lastRunAt="{ item }">
          <noo-date
            v-if="item.lastRunAt"
            :value="item.lastRunAt"
            include-time
            multiline
          />
          <noo-text-block
            v-else
            no-margin
            dimmed
            size="small"
          >
            ещё не запускалась
          </noo-text-block>
          <noo-text-block
            v-if="item.lastRowCount !== null"
            no-margin
            dimmed
            size="small"
          >
            строк: {{ item.lastRowCount }}
          </noo-text-block>
        </template>
        <template #column-googleAccount="{ item }">
          <noo-text-block
            no-margin
            dimmed
          >
            {{ item.googleAccount ?? '—' }}
          </noo-text-block>
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
      <noo-title :size="2">Удалить выгрузку?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Настройка выгрузки будет удалена безвозвратно. Сама Google-таблица и
        выгруженные в неё данные останутся на Вашем Google Диске.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Удалить</template>
  </noo-sure-modal>
</template>

<script lang="ts" setup>
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { RowAction } from '@/components/entity-table/noo-entity-table.vue'
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import GoogleSheetsCreateModal from '../components/google-sheets-create-modal.vue'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleSheetsIntegrationEntity,
  GoogleSheetsIntegrationStatus
} from '../api/google-sheets.types'
import {
  googleSheetsIntegrationRunStateLabels,
  googleSheetsIntegrationScheduleLabels,
  googleSheetsIntegrationStatusLabels,
  googleSheetsIntegrationTypeLabels
} from '../constants'
import { useGoogleSheetsSettingsStore } from '../stores/google-sheets-settings.store'

/** How often to re-check a run that is already in flight. */
const RUNNING_POLL_INTERVAL = 5000

const store = useGoogleSheetsSettingsStore()

const isCreateOpen = shallowRef(false)
const isDeleteOpen = shallowRef(false)
const pendingDeleteId = shallowRef<string | null>(null)

const columns: EntityTableColumnType<GoogleSheetsIntegrationEntity>[] = [
  { key: 'name', title: 'Название' },
  { key: 'type', title: 'Тип' },
  { key: 'schedule', title: 'Расписание' },
  { key: 'status', title: 'Статус' },
  { key: 'lastRunAt', title: 'Последняя выгрузка' },
  { key: 'googleAccount', title: 'Google-аккаунт' }
]

/**
 * A run in flight owns the integration until the dispatcher releases it, so the
 * actions that would interfere are hidden rather than shown disabled.
 */
const isIdle = (item: GoogleSheetsIntegrationEntity) => item.runState === 'idle'

const rowActions: RowAction<GoogleSheetsIntegrationEntity>[] = [
  {
    label: 'Запустить',
    icon: 'arrow-right',
    if: isIdle,
    action: (item) => store.run.execute(item.id)
  },
  {
    label: 'Включить',
    icon: 'check-green',
    if: (item) => isIdle(item) && item.status !== 'active',
    action: (item) => setStatus(item, 'active')
  },
  {
    label: 'Отключить',
    icon: 'minus-yellow',
    if: (item) => isIdle(item) && item.status === 'active',
    action: (item) => setStatus(item, 'inactive')
  },
  {
    label: 'Удалить',
    icon: 'delete',
    variant: 'danger',
    if: isIdle,
    action: (item) => askDelete(item.id)
  }
]

const hasRunningIntegrations = computed(() =>
  (store.search.data ?? []).some((item) => item.runState !== 'idle')
)

// Runs happen in the background, so the list has to ask for their progress —
// but only while something is actually running.
let pollTimer: number | undefined

watch(hasRunningIntegrations, (isRunning) => {
  window.clearInterval(pollTimer)
  pollTimer = undefined

  if (isRunning) {
    pollTimer = window.setInterval(
      () => store.search.reload(),
      RUNNING_POLL_INTERVAL
    )
  }
})

onUnmounted(() => window.clearInterval(pollTimer))

async function onCreate(dto: CreateGoogleSheetsIntegrationDto): Promise<void> {
  await store.create.execute(dto)

  if (!store.create.error) {
    isCreateOpen.value = false
  }
}

function setStatus(
  item: GoogleSheetsIntegrationEntity,
  status: GoogleSheetsIntegrationStatus
): void {
  store.update.execute({ id: item.id, changes: { status } })
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
</script>

<style lang="sass" scoped>
.google-sheets-settings-view
  // The table carries six columns of mostly secondary detail, so it reads
  // better a step down from body size. Its paddings are in em, so they scale
  // with it rather than leaving the rows loose.
  :deep(.noo-entity-table)
    font-size: 0.85em

  &__error-text
    color: var(--danger-color, var(--text-color))
</style>
