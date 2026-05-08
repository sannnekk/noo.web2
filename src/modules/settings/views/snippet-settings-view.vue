<template>
  <div class="snippet-settings-view">
    <noo-section
      title="Сниппеты"
      description="Сниппеты — это сохранённые заготовки текста, которые Вы можете быстро вставлять в комментарии к работам."
    >
      <div
        v-if="isInitialLoading"
        class="snippet-settings-view__loading"
      >
        <noo-loader-icon contrast />
      </div>
      <noo-error-block
        v-else-if="loadError"
        no-margin
        with-image
        :try-again="() => store.init()"
      >
        Не удалось загрузить сниппеты.
      </noo-error-block>
      <template v-else>
        <noo-card-stack
          v-if="snippets.length"
          :cols="1"
        >
          <noo-snippet-card
            v-for="snippet in snippets"
            :key="snippet.id"
            :snippet="snippet"
          >
            <template #actions>
              <noo-button
                size="small"
                variant="inline"
                :disabled="isRowBusy(snippet.id)"
                @click="openEditor(snippet)"
              >
                Редактировать
              </noo-button>
              <noo-button
                size="small"
                variant="danger-inline"
                :is-loading="isDeleting(snippet.id)"
                :disabled="isRowBusy(snippet.id)"
                @click="askDelete(snippet.id)"
              >
                Удалить
              </noo-button>
            </template>
          </noo-snippet-card>
        </noo-card-stack>
        <noo-text-block
          v-else
          dimmed
          no-margin
          size="small"
        >
          У Вас пока нет сниппетов. Создайте первый, чтобы быстро вставлять
          часто используемый текст.
        </noo-text-block>

        <div class="snippet-settings-view__actions">
          <noo-button
            variant="primary"
            size="medium"
            @click="openCreator()"
          >
            Создать сниппет
          </noo-button>
        </div>
      </template>
    </noo-section>
  </div>

  <snippet-edit-modal
    v-if="store.draft"
    v-model:is-open="isEditorOpen"
    :name="store.draft.name"
    :content="store.draft.content"
    :is-new="store.isDraftNew"
    :has-changes="store.hasUnsavedChanges"
    :is-loading="store.save.isLoading"
    @update:name="onNameChange"
    @update:content="onContentChange"
    @save="store.save.execute()"
  />

  <noo-sure-modal
    v-model:is-open="isDeleteOpen"
    @confirm="confirmDelete"
    @cancel="pendingDeleteId = null"
  >
    <template #title>
      <noo-title :size="2">Удалить сниппет?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Это действие нельзя отменить. Сниппет будет удалён безвозвратно.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Удалить</template>
  </noo-sure-modal>
</template>

<script lang="ts" setup>
import type { IRichText } from '@/core/utils/richtext.utils'
import type { SnippetEntity } from '@/modules/assigned-works/api/snippet.types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import SnippetEditModal from '../components/snippet-edit-modal.vue'
import { useSnippetSettingsStore } from '../stores/snippet-settings.store'

const store = useSnippetSettingsStore()

const isEditorOpen = shallowRef(false)
const isDeleteOpen = shallowRef(false)
const pendingDeleteId = shallowRef<string | null>(null)

const isInitialLoading = computed(
  () => !store.list.data && store.list.isLoading
)
const loadError = computed(() => !store.list.data && !!store.list.error)
const snippets = computed<SnippetEntity[]>(() => store.list.data ?? [])

function isDeleting(id: string): boolean {
  return store.remove.isLoading && pendingDeleteId.value === id
}

function isRowBusy(id: string): boolean {
  return isDeleting(id) || store.save.isLoading
}

function openCreator(): void {
  store.startCreate()
  isEditorOpen.value = true
}

function openEditor(snippet: SnippetEntity): void {
  store.startEdit(snippet)
  isEditorOpen.value = true
}

function onNameChange(value: string): void {
  if (store.draft) {
    store.draft.name = value
  }
}

function onContentChange(value: IRichText | null): void {
  if (store.draft) {
    store.draft.content = value
  }
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

watch(isEditorOpen, (open) => {
  if (!open) {
    store.resetDraft()
  }
})

watch(
  () => store.remove.isLoading,
  (loading) => {
    if (!loading && pendingDeleteId.value && !store.remove.error) {
      pendingDeleteId.value = null
    }
  }
)

onMounted(() => {
  store.init()
})

onBeforeUnmount(() => {
  store.resetDraft()
})
</script>

<style lang="sass" scoped>
.snippet-settings-view
  display: flex
  flex-direction: column
  gap: 2em

  &__loading
    display: flex
    justify-content: center
    font-size: 2em

  &__actions
    display: flex
    flex-wrap: wrap
    gap: 0.75em
    margin-top: 1em
</style>
