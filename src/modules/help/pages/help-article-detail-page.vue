<template>
  <div
    v-if="store.isArticleLoading"
    class="help-article-detail-page__loading"
  >
    <noo-loader-icon />
  </div>
  <div
    v-else-if="store.articleError"
    class="help-article-detail-page__error"
  >
    <noo-error-block
      with-image
      :try-again="retry"
    >
      Не удалось загрузить статью
    </noo-error-block>
  </div>
  <div
    v-else-if="store.article"
    class="help-article-detail-page"
  >
    <div class="help-article-detail-page__header">
      <noo-title
        v-if="isReadonly"
        :size="2"
      >
        {{ store.article.title }}
      </noo-title>
      <noo-text-input
        v-else
        v-model="store.article.title"
        label="Название статьи"
        :validators="[(value) => isStringOfLength(value, 1, 255)]"
      />

      <div
        v-if="canManage"
        class="help-article-detail-page__meta"
      >
        <noo-active-tag
          v-if="isReadonly"
          :active="store.article.isActive"
        />
        <noo-checkbox
          v-else
          v-model="store.article.isActive"
          dimmed
          size="small"
        >
          Статья опубликована
        </noo-checkbox>
      </div>
    </div>

    <div class="help-article-detail-page__content">
      <noo-richtext-block
        v-if="isReadonly"
        :value="store.article.content"
      />
      <noo-richtext-editor
        v-else
        v-model="store.article.content"
      />
    </div>

    <div
      v-if="canManage"
      class="help-article-detail-page__actions"
    >
      <template v-if="isReadonly">
        <noo-button
          variant="secondary"
          @click="store.setMode('edit')"
        >
          Редактировать
        </noo-button>
        <noo-button
          variant="danger-inline"
          @click="deleteModalOpen = true"
        >
          Удалить
        </noo-button>
      </template>
      <template v-else>
        <noo-button
          variant="primary"
          @click="onSave()"
        >
          {{ store.mode === 'create' ? 'Создать' : 'Сохранить' }}
        </noo-button>
        <noo-button
          variant="inline"
          @click="onCancel()"
        >
          Отменить
        </noo-button>
      </template>
    </div>
  </div>

  <noo-sure-modal
    v-model:is-open="deleteModalOpen"
    @confirm="onDelete()"
  >
    <template #title>
      <noo-title :size="3"> Удалить статью </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Удалить </template>
  </noo-sure-modal>

  <noo-sure-modal
    v-model:is-open="discardModalOpen"
    @confirm="discardChanges()"
  >
    <template #title>
      <noo-title :size="3"> Несохранённые изменения </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        У вас есть несохранённые изменения. Если вы продолжите, они будут
        потеряны.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Отменить изменения </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import { isStringOfLength } from '@/core/validators/string.utils'
import { computed, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { HelpPermissions, useHelpPermissions } from '../permissions'
import { useHelpEditStore } from '../stores/help-edit.store'

interface Props {
  // Absent when the page is rendered inline to create a new article; the
  // create draft is then prepared by the store via `startCreate`.
  articleSlug?: string
}

const props = defineProps<Props>()

const store = useHelpEditStore()
const router = useRouter()
const { can } = useHelpPermissions()

const deleteModalOpen = shallowRef(false)
const discardModalOpen = shallowRef(false)

const canManage = computed(() => can(HelpPermissions.manageArticles))
const isReadonly = computed(() => store.mode === 'view')

watch(
  () => props.articleSlug,
  (slug) => {
    if (slug) {
      store.loadArticle(slug)
    }
  },
  { immediate: true }
)

function retry(): void {
  if (props.articleSlug) {
    store.loadArticle(props.articleSlug)
  }
}

async function onSave(): Promise<void> {
  const isCreating = store.mode === 'create'
  const slug = await store.save()

  if (!isCreating || !store.category) {
    return
  }

  router.replace(
    slug
      ? {
          name: 'help.articles.detail',
          params: { category: store.category, articleSlug: slug }
        }
      : { name: 'help.articles', params: { category: store.category } }
  )
}

function onCancel(): void {
  if (store.hasChanges()) {
    discardModalOpen.value = true

    return
  }

  discardChanges()
}

function discardChanges(): void {
  if (store.mode === 'create') {
    const category = store.category ?? 'courses'

    store.discardDraft()
    router.replace({ name: 'help.articles', params: { category } })

    return
  }

  store.cancelEdit()
}

async function onDelete(): Promise<void> {
  const removed = await store.remove()

  if (removed) {
    router.replace({
      name: 'help.articles',
      params: { category: store.category ?? 'courses' }
    })
  }
}
</script>

<style scoped lang="sass">
.help-article-detail-page
  display: flex
  flex-direction: column
  gap: 1.5em

  &__meta
    display: flex
    align-items: center
    gap: 0.5em

  &__actions
    display: flex
    align-items: center
    gap: 1em

  &__loading,
  &__error
    display: flex
    justify-content: center
    padding: 2em 0
</style>
