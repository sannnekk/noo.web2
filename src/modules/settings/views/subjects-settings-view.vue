<template>
  <div class="subjects-settings-view">
    <noo-section
      title="Предметы"
      description="Предметы используются в курсах, работах и назначениях кураторов. Здесь Вы можете создавать новые предметы и изменять существующие. Для удаления предмета, пожалуйста, обратитесь к администратору системы."
    >
      <noo-entity-table
        :columns="columns"
        :is-loading="isInitialLoading"
        :data="subjects"
        :error="loadError"
        :try-again="() => store.init()"
      >
        <template #empty>
          <noo-text-block
            dimmed
            no-margin
          >
            Предметов пока нет. Создайте первый, чтобы использовать его в курсах
            и работах.
          </noo-text-block>
        </template>
        <template #column-name="{ item }">
          <noo-subject-block :subject="item" />
        </template>
        <template #column-color="{ item }">
          <span class="subjects-settings-view__color">
            <noo-color-badge :color="item.color" />
            {{ item.color }}
          </span>
        </template>
        <template #column-createdAt="{ item }">
          <noo-date
            :value="item.createdAt"
            timezones="both"
            include-time
          />
        </template>
        <template #column-actions="{ item }">
          <noo-button
            variant="inline"
            size="small"
            :disabled="store.save.isLoading"
            @click="openEditor(item)"
          >
            Редактировать
          </noo-button>
        </template>
      </noo-entity-table>

      <div class="subjects-settings-view__actions">
        <noo-button
          variant="primary"
          size="medium"
          @click="openCreator()"
        >
          Добавить предмет
        </noo-button>
      </div>
    </noo-section>
  </div>

  <subject-edit-modal
    v-if="store.draft"
    v-model:is-open="isEditorOpen"
    :name="store.draft.name"
    :color="store.draft.color"
    :is-new="store.isDraftNew"
    :has-changes="store.hasUnsavedChanges"
    :is-loading="store.save.isLoading"
    @update:name="onNameChange"
    @update:color="onColorChange"
    @save="store.save.execute()"
  />
</template>

<script lang="ts" setup>
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import SubjectEditModal from '../components/subject-edit-modal.vue'
import { useSubjectSettingsStore } from '../stores/subject-settings.store'

const store = useSubjectSettingsStore()

const isEditorOpen = shallowRef(false)

const isInitialLoading = computed(
  () => !store.list.data && store.list.isLoading
)
const loadError = computed(() => (!store.list.data ? store.list.error : null))
const subjects = computed<SubjectEntity[]>(() => store.list.data ?? [])

const columns: EntityTableColumnType<SubjectEntity>[] = [
  { title: 'Предмет', key: 'name' },
  { title: 'Цвет', key: 'color' },
  { title: 'Создан', key: 'createdAt' },
  { title: '', key: 'actions', disableLink: true }
]

function openCreator(): void {
  store.startCreate()
  isEditorOpen.value = true
}

function openEditor(subject: SubjectEntity): void {
  store.startEdit(subject)
  isEditorOpen.value = true
}

function onNameChange(value: string): void {
  if (store.draft) {
    store.draft.name = value
  }
}

function onColorChange(value: string): void {
  if (store.draft) {
    store.draft.color = value
  }
}

watch(isEditorOpen, (open) => {
  if (!open) {
    store.resetDraft()
  }
})

onMounted(() => {
  store.init()
})

onBeforeUnmount(() => {
  store.resetDraft()
})
</script>

<style lang="sass" scoped>
.subjects-settings-view
  display: flex
  flex-direction: column
  gap: 2em

  &__color
    display: inline-flex
    align-items: center
    gap: 0.5em
    font-variant-numeric: tabular-nums

  &__actions
    display: flex
    flex-wrap: wrap
    gap: 0.75em
    margin-top: 1em
</style>
