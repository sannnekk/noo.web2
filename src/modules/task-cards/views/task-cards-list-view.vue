<template>
  <div class="task-cards-list-view">
    <noo-card-search-view
      v-model:page="page"
      v-model:search="search"
      :items="items"
      :total-count="totalCount"
      :limit="limit"
      :is-loading="isLoading"
      :per-row="3"
      gap="0.75em"
      tile-min-width="20rem"
      :error="error"
      :try-again="tryAgain"
    >
      <template #actions>
        <noo-button
          v-if="items.length"
          :to="{ name: 'task-cards.quiz' }"
        >
          Начать квиз
        </noo-button>
      </template>

      <template #above-content>
        <noo-text-block
          v-if="items.length"
          class="task-cards-list-view__above-content"
          dimmed
        >
          Здесь отображаются задания, которые вы сохранили из проверенных работ.
          Имея больше 5 сохраненных заданий по опредеоеллному предмету, вы
          сможете пройти квиз по ним.
        </noo-text-block>
      </template>

      <template #empty>
        <div class="task-cards-list-view__empty">
          <noo-not-found-image />
          <noo-title
            :size="4"
            align="center"
          >
            {{
              search
                ? 'Ничего не найдено'
                : 'Вы пока не сохранили ни одного задания'
            }}
          </noo-title>
          <noo-text-block
            align="center"
            size="medium"
            dimmed
          >
            {{
              search
                ? 'Попробуйте изменить параметры поиска'
                : 'Откройте проверенную работу и нажмите «Сохранить задание» — оно появится здесь.'
            }}
          </noo-text-block>
        </div>
      </template>

      <template #tile="{ item }">
        <noo-saved-task-card
          :saved-task="item"
          :actions="actionsFor(item)"
        >
          <template
            v-if="item.assignedWorkId"
            #footer
          >
            <noo-button
              variant="inline"
              size="small"
              :to="assignedWorkRoute(item)"
            >
              Открыть в работе
            </noo-button>
          </template>
        </noo-saved-task-card>
      </template>
    </noo-card-search-view>

    <noo-sure-modal
      v-model:is-open="isRemoveOpen"
      @confirm="onConfirmRemove"
    >
      <template #title>
        <noo-title :size="2"> Убрать задание из сохранённых? </noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Задание из работы «{{ removedTask?.work?.title ?? 'без названия' }}»
          больше не будет отображаться на этой странице.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Убрать </template>
    </noo-sure-modal>
  </div>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import { isApiError, type ApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { ref } from 'vue'
import type { RouteLocationAsRelativeGeneric } from 'vue-router'
import { SavedTaskService } from '../api/saved-task.service'
import type { SavedTaskEntity } from '../api/saved-task.types'

interface Props {
  items: SavedTaskEntity[]
  totalCount: number
  isLoading?: boolean
  limit?: number
  error?: ApiError | null
  tryAgain?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 25,
  isLoading: false
})

const page = defineModel<number>('page', {
  default: 1
})

const search = defineModel<string>('search', {
  default: ''
})

const globalUiStore = useGlobalUIStore()

const isRemoveOpen = ref(false)
const removedTask = ref<SavedTaskEntity | null>(null)

function actionsFor(savedTask: SavedTaskEntity): DropdownAction[] {
  return [
    {
      label: 'Убрать из сохранённых',
      icon: 'delete',
      variant: 'danger',
      onClick: () => openRemoveModal(savedTask)
    }
  ]
}

function assignedWorkRoute(
  savedTask: SavedTaskEntity
): RouteLocationAsRelativeGeneric {
  return {
    name: 'assigned-works.detail.task',
    params: {
      assignedWorkId: savedTask.assignedWorkId,
      mode: 'read',
      taskId: savedTask.taskId
    }
  }
}

function openRemoveModal(savedTask: SavedTaskEntity) {
  removedTask.value = savedTask
  isRemoveOpen.value = true
}

async function onConfirmRemove() {
  const savedTask = removedTask.value

  if (!savedTask) {
    return
  }

  const response = await SavedTaskService.delete(savedTask.id)

  if (isApiError(response)) {
    globalUiStore.createApiErrorToast(
      'Не удалось убрать задание из сохранённых',
      response.error
    )

    return
  }

  globalUiStore.createSuccessToast('Задание убрано из сохранённых')
  props.tryAgain?.()
}
</script>

<style scoped lang="sass">
.task-cards-list-view
  &__empty
    text-align: center
    width: min(max(600px, 90%), 100%)

    img
      max-width: 50%

  &__above-content
    margin: var(--space-xs)
</style>
