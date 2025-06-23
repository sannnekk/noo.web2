<template>
  <noo-base-modal
    v-model:is-open="isOpen"
    full-width
  >
    <template #title>
      <noo-title :size="2">
        История изменений
      </noo-title>
    </template>
    <template #content>
      <div
        v-if="history.isLoading.value"
        class="history-modal__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <div
        v-else-if="!history.isLoading.value && !history.error.value && history.data.value"
        class="history-modal__content"
      >
        <noo-entity-table
          :data="history.data.value"
          :columns="columns"
        >
          <template #column-status="{ item}">
            <noo-text-block>
              {{ readableHistoryStatus(item.status) }}
            </noo-text-block>
          </template>
          <template #column-createdAt="{ item }">
            <noo-text-block dimmed>
              <noo-date
                :value="item.createdAt"
                timezones="both"
                include-time
              />
            </noo-text-block>
          </template>
          <template #column-changedBy="{ item }">
            <noo-inline-user-card :user="item.changedBy" />
          </template>
        </noo-entity-table>
      </div>
      <div
        v-else
        class="history-modal__error"
      >
        <noo-error-block>
          {{ history.error.value?.description ?? 'Не удалось загрузить историю изменений' }}
        </noo-error-block>
      </div>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="isOpen = false"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers';
import { useApiRequest } from '@/core/composables/useApiRequest';
import { watch } from 'vue';
import type { AssignedWorkStatusHistoryEntity } from '../api/assigned-work.types';
import { assignedWorkHistory } from '../mock-data/assigned-work-history';
import { readableHistoryStatus } from '../utils';

interface Props {
  assignedWorkId: string
}

const props = defineProps<Props>();

const isOpen = defineModel<boolean>('is-open', {
  default: false,
});

const history = useApiRequest<void, AssignedWorkStatusHistoryEntity[]>(
  () => {
    /* AssignedWorkService.getHistory(props.assignedWorkId) */
    return Promise.resolve({
      data: assignedWorkHistory
    })
  }
)

watch(
  isOpen,
  () => {
    if (isOpen.value && !history.isLoading.value && shouldLoadHistory()) {
      history.execute();
    }
  },
  { immediate: true }
)

function shouldLoadHistory(): boolean {
  return (
    history.data.value === null ||
    history.data.value.length === 0 ||
    history.data.value[0].assignedWorkId !== props.assignedWorkId
  );
}

const columns: EntityTableColumnType<AssignedWorkStatusHistoryEntity>[] = [
  {
    key: 'status',
    title: 'Статус',
  },
  {
    key: 'createdAt',
    title: 'Дата создания',
  },
  {
    key: 'changedBy',
    title: 'Изменено пользователем',
  },
]
</script>

<style scoped lang="sass">
.history-modal
  &__loading
    display: flex
    justify-content: center
    align-items: center
    height: 200px
    font-size: 3em
</style>
