<template>
  <noo-base-modal
    v-model:is-open="isOpen"
    close-on-esc
    close-on-outside-click
    full-width
  >
    <template #title>
      <noo-title
        :size="5"
        no-margin
      >
        Статистика скачиваний
      </noo-title>
      <noo-title :size="3">
        {{ materialTitle }}
      </noo-title>
    </template>
    <template #content>
      <template v-if="selectedFile">
        <div class="material-file-downloads-modal__drilldown-head">
          <noo-button
            variant="secondary"
            size="small"
            @click="selectedFile = null"
          >
            Ко всем файлам
          </noo-button>
          <noo-text-block
            no-margin
            dimmed
          >
            {{ fileName(selectedFile) }}
          </noo-text-block>
        </div>

        <noo-search-view
          v-model:page="downloaders.page.value"
          :columns="downloaderColumns"
          :is-loading="downloaders.isLoading.value"
          :items="downloaders.data.value"
          :total-count="downloaders.total.value"
          :error="downloaders.error.value"
          :try-again="downloaders.reload"
          :with-search="false"
        >
          <template #column-user="{ item }">
            <noo-inline-user-card :user="item.user" />
          </template>

          <template #column-downloadCount="{ item }">
            <noo-text-block no-margin>
              {{ item.downloadCount }}
            </noo-text-block>
          </template>

          <template #column-lastDownloadAt="{ item }">
            <noo-date
              :value="item.lastDownloadAt"
              include-time
              multiline
            />
          </template>

          <template #column-firstDownloadAt="{ item }">
            <noo-date
              :value="item.firstDownloadAt"
              include-time
              multiline
            />
          </template>
        </noo-search-view>
      </template>

      <template v-else>
        <div
          v-if="summary.isLoading.value"
          class="material-file-downloads-modal__loading"
        >
          <noo-loader-icon contrast />
        </div>

        <div
          v-else-if="summary.error.value"
          class="material-file-downloads-modal__error"
        >
          <noo-error-block
            with-image
            centered
            :try-again="reloadSummary"
          >
            <noo-title :size="4">
              Не удалось загрузить статистику скачиваний
            </noo-title>
          </noo-error-block>
        </div>

        <noo-text-block
          v-else-if="!files.length"
          dimmed
          align="center"
        >
          К этому материалу не прикреплено ни одного файла.
        </noo-text-block>

        <noo-entity-table
          v-else
          :columns="fileColumns"
          :data="files"
          :actions="fileActions"
        >
          <template #column-media="{ item }">
            <noo-text-block no-margin>
              {{ fileName(item) }}
            </noo-text-block>
          </template>

          <template #column-totalDownloads="{ item }">
            <noo-text-block no-margin>
              {{ item.totalDownloads }}
            </noo-text-block>
          </template>

          <template #column-uniqueUsers="{ item }">
            <noo-text-block no-margin>
              {{ item.uniqueUsers }}
            </noo-text-block>
          </template>

          <template #column-lastDownloadAt="{ item }">
            <noo-date
              v-if="item.lastDownloadAt"
              :value="item.lastDownloadAt"
              include-time
              multiline
            />
            <noo-text-block
              v-else
              dimmed
              no-margin
            >
              —
            </noo-text-block>
          </template>
        </noo-entity-table>
      </template>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="secondary"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { RowAction } from '@/components/entity-table/noo-entity-table.vue'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useSearch } from '@/core/composables/useSearch'
import { EqualsFilter } from '@/core/utils/pagination.utils'
import { computed, ref, watch } from 'vue'
import { MaterialStatisticsService } from '../api/material-statistics.service'
import type {
  MaterialFileDownloader,
  MaterialFileDownloadSummary
} from '../api/material-statistics.types'

interface Props {
  materialId: string | null
  materialTitle?: string
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

const selectedFile = ref<MaterialFileDownloadSummary | null>(null)

const summary = useApiRequest((materialId: string) =>
  MaterialStatisticsService.getFileDownloadSummary(materialId)
)

const downloaders = useSearch<MaterialFileDownloader>(
  (pagination) =>
    MaterialStatisticsService.getFileDownloaders(
      props.materialId ?? '',
      pagination
    ),
  { immediate: false }
)

const files = computed(() => summary.data.value ?? [])

// The API defaults actualName to an empty string rather than null, so a plain ?? would
// happily return "".
function fileName(file: MaterialFileDownloadSummary): string {
  const named = [file.media.actualName, file.media.name].find(
    (value) => value !== null && value.trim().length > 0
  )

  return named ?? 'Без названия'
}

function reloadSummary() {
  if (props.materialId) {
    summary.execute(props.materialId)
  }
}

// Reopening on a different material must not show the previous one's drill-down.
watch(
  () => (isOpen.value ? props.materialId : null),
  (materialId) => {
    selectedFile.value = null

    if (materialId) {
      summary.execute(materialId)
    }
  },
  { immediate: true }
)

// Swapping the filter is what re-runs the search; useSearch watches it.
watch(selectedFile, (file) => {
  if (file) {
    downloaders.filters.value = [new EqualsFilter('mediaId', file.media.id)]
  }
})

const fileColumns: EntityTableColumnType<MaterialFileDownloadSummary>[] = [
  { title: 'Файл', key: 'media' },
  { title: 'Скачиваний', key: 'totalDownloads', width: '10em' },
  { title: 'Учеников', key: 'uniqueUsers', width: '10em' },
  { title: 'Последнее', key: 'lastDownloadAt', width: '12em' }
]

const fileActions: RowAction<MaterialFileDownloadSummary>[] = [
  {
    icon: 'users',
    label: 'Кто скачивал',
    action: (item) => {
      selectedFile.value = item
    }
  }
]

const downloaderColumns: EntityTableColumnType<MaterialFileDownloader>[] = [
  { title: 'Ученик', key: 'user' },
  { title: 'Скачиваний', key: 'downloadCount', width: '10em' },
  { title: 'Первое', key: 'firstDownloadAt', width: '12em' },
  { title: 'Последнее', key: 'lastDownloadAt', width: '12em' }
]
</script>

<style scoped lang="sass">
.material-file-downloads-modal
  &__drilldown-head
    display: flex
    align-items: center
    gap: 0.75em
    flex-wrap: wrap
    margin-bottom: 1em

  &__loading,
  &__error
    display: flex
    align-items: center
    justify-content: center
    padding: 3em 1em
</style>
