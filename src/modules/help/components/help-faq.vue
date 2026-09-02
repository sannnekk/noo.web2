<template>
  <noo-section
    v-if="store.isListLoading || store.items.length || canManage"
    title="Частые вопросы"
    description="Короткие ответы на то, о чём нас спрашивают чаще всего"
  >
    <div
      v-if="store.isListLoading"
      class="help-faq__loading"
    >
      <noo-loader-icon />
    </div>
    <noo-error-block
      v-else-if="store.listFailed"
      :try-again="() => store.load(canManage, true)"
    >
      <noo-title :size="4">Не удалось загрузить вопросы</noo-title>
    </noo-error-block>
    <noo-text-block
      v-else-if="!store.items.length && store.mode === 'view'"
      dimmed
      no-margin
    >
      Вопросов пока нет.
    </noo-text-block>
    <div
      v-else
      class="help-faq"
    >
      <template
        v-for="item in store.items"
        :key="item.id"
      >
        <help-faq-editor
          v-if="store.isEditing(item.id)"
          @save="onSave()"
          @cancel="onCancel()"
        />
        <noo-collapsable-block
          v-else
          class="help-faq__item"
        >
          <template #collapsed>
            <span class="help-faq__item__question">
              {{ item.question }}
              <noo-active-tag
                v-if="canManage && !item.isActive"
                :active="false"
              />
            </span>
          </template>
          <template #visible>
            <div class="help-faq__item__answer">
              <noo-richtext-block :value="item.answer" />
              <noo-inline-link
                v-if="item.category"
                size="small"
                :to="{
                  name: 'help.articles',
                  params: { category: item.category }
                }"
              >
                Все статьи по теме «{{ categoryTitle(item.category) }}»
              </noo-inline-link>
              <div
                v-if="canManage"
                class="help-faq__item__answer__actions"
              >
                <noo-button
                  variant="inline"
                  size="small"
                  :disabled="store.isSaving"
                  @click="store.startEdit(item)"
                >
                  Редактировать
                </noo-button>
                <noo-button
                  variant="danger-inline"
                  size="small"
                  :disabled="store.isSaving"
                  @click="askToRemove(item)"
                >
                  Удалить
                </noo-button>
              </div>
            </div>
          </template>
        </noo-collapsable-block>
      </template>

      <help-faq-editor
        v-if="store.mode === 'create'"
        @save="onSave()"
        @cancel="onCancel()"
      />
    </div>

    <div
      v-if="canManage && store.mode === 'view'"
      class="help-faq__actions"
    >
      <noo-button
        variant="secondary"
        @click="store.startCreate()"
      >
        Добавить вопрос
      </noo-button>
    </div>
  </noo-section>

  <noo-sure-modal
    v-model:is-open="isRemoveOpen"
    @confirm="confirmRemove()"
  >
    <template #title>
      <noo-title :size="3">Удалить вопрос</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Вопрос «{{ itemToRemove?.question }}» будет удалён безвозвратно.
      </noo-text-block>
    </template>
    <template #confirm-action-text>Удалить</template>
  </noo-sure-modal>

  <noo-unsaved-changes-modal
    v-model:is-open="isAsking"
    :can-save="canSaveOnLeave"
    @decide="decide"
  />
</template>

<script setup lang="ts">
import { useUnsavedChangesGuard } from '@/core/composables/useUnsavedChangesGuard'
import { computed, onMounted, shallowRef, watch } from 'vue'
import type {
  SupportCategory,
  SupportFaqItemEntity
} from '../api/support.types'
import { helpCategories } from '../content'
import { HelpPermissions, useHelpPermissions } from '../permissions'
import { useHelpFaqStore } from '../stores/help-faq.store'
import HelpFaqEditor from './help-faq-editor.vue'

const store = useHelpFaqStore()
const { can } = useHelpPermissions()

const canManage = computed(() => can(HelpPermissions.manageFaq))

const isRemoveOpen = shallowRef(false)
const itemToRemove = shallowRef<SupportFaqItemEntity | null>(null)

const {
  isAsking,
  canSave: canSaveOnLeave,
  decide,
  confirm
} = useUnsavedChangesGuard({
  hasChanges: () => store.hasChanges(),
  save: async () => await store.save(canManage.value)
})

function categoryTitle(category: SupportCategory): string {
  return helpCategories.find((item) => item.category === category)?.title ?? ''
}

function askToRemove(item: SupportFaqItemEntity): void {
  itemToRemove.value = item
  isRemoveOpen.value = true
}

async function confirmRemove(): Promise<void> {
  if (itemToRemove.value) {
    await store.remove(itemToRemove.value, canManage.value)
  }

  itemToRemove.value = null
}

async function onSave(): Promise<void> {
  await store.save(canManage.value)
}

async function onCancel(): Promise<void> {
  if (await confirm()) {
    store.cancelEdit()
  }
}

// A manager's list includes unpublished questions, so the load waits until the
// session says which of the two lists this is.
watch(canManage, (value) => store.load(value, store.isLoaded))

onMounted(() => store.load(canManage.value))
</script>

<style scoped lang="sass">
.help-faq
  display: flex
  flex-direction: column
  gap: var(--space-3xs)

  &__loading
    display: flex
    justify-content: center
    padding: var(--space-s) 0

  &__item
    &__question
      padding: 0.6em 0
      font-weight: 500
      display: inline-flex
      align-items: center
      gap: 0.5em

    &__answer
      padding: var(--space-2xs) var(--space-s) var(--space-xs) 2.4em

      &__actions
        display: flex
        align-items: center
        gap: 0.5em
        margin-top: var(--space-2xs)

  &__actions
    margin-top: var(--space-s)
</style>
