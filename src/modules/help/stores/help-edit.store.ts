import { isApiError } from '@/core/api/api.utils'
import { useApiRequest } from '@/core/composables/useApiRequest'
import { useSearch } from '@/core/composables/useSearch'
import { useViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { SupportService } from '../api/support.service'
import type {
  PossiblyUnsavedSupportArticle,
  SupportArticleEntity,
  SupportCategory
} from '../api/support.types'
import { toPossiblyUnsaved } from '../utils'

const ARTICLES_PER_PAGE = 100

/**
 * Coordinates the help section's sidebar list and the currently
 * viewed/edited/created article so both stay in sync after mutations.
 */
const useHelpEditStore = defineStore('help:edit', () => {
  const uiStore = useGlobalUIStore()
  const { mode, setMode } = useViewMode('view')

  const category = shallowRef<SupportCategory | null>(null)

  const articles = useSearch<SupportArticleEntity>(
    (pagination) =>
      SupportService.getArticlesByCategory(
        category.value ?? 'courses',
        pagination
      ),
    { immediate: false }
  )

  articles.pageSize.value = ARTICLES_PER_PAGE

  const article = ref<PossiblyUnsavedSupportArticle | null>(null)
  const patchGenerator =
    shallowRef<PatchGenerator<PossiblyUnsavedSupportArticle> | null>(null)

  const articleRequest = useApiRequest(
    SupportService.getArticleBySlug,
    (response) => {
      article.value = toPossiblyUnsaved(response.data)
      patchGenerator.value = JsonPatchUtils.observe(article.value)
    }
  )

  async function loadArticles(value: SupportCategory): Promise<void> {
    category.value = value
    await articles.reload()
  }

  async function reloadArticles(): Promise<void> {
    if (category.value) {
      await articles.reload()
    }
  }

  async function loadArticle(slug: string): Promise<void> {
    setMode('view')
    article.value = null
    patchGenerator.value = null
    await articleRequest.execute(slug)
  }

  function startCreate(value: SupportCategory): void {
    category.value = value
    article.value = SupportService.createDraft(value)
    patchGenerator.value = JsonPatchUtils.observe(article.value)
    setMode('create')
  }

  function discardDraft(): void {
    article.value = null
    patchGenerator.value = null
    setMode('view')
  }

  function hasChanges(): boolean {
    return (patchGenerator.value?.countChanges() ?? 0) > 0
  }

  function cancelEdit(): void {
    if (!article.value || !patchGenerator.value) {
      return
    }

    article.value = patchGenerator.value.getOriginal()
    patchGenerator.value = JsonPatchUtils.observe(article.value)
    setMode('view')
  }

  async function save(): Promise<string | null> {
    if (!article.value) {
      return null
    }

    return article.value.id ? await updateArticle() : await createArticle()
  }

  async function updateArticle(): Promise<string | null> {
    if (!article.value?.id || !patchGenerator.value) {
      return null
    }

    uiStore.setLoading(true)

    const response = await SupportService.updateArticle(
      article.value.id,
      patchGenerator.value.generate()
    )

    uiStore.setLoading(false)

    if (isApiError(response)) {
      uiStore.createApiErrorToast('Не удалось сохранить статью', response.error)

      return null
    }

    uiStore.createSuccessToast('Статья сохранена')
    patchGenerator.value = JsonPatchUtils.observe(article.value)
    setMode('view')
    await reloadArticles()

    return article.value.slug
  }

  async function createArticle(): Promise<string | null> {
    if (!article.value) {
      return null
    }

    uiStore.setLoading(true)

    const response = await SupportService.createArticle(article.value)

    uiStore.setLoading(false)

    if (isApiError(response) || !response.data) {
      uiStore.createApiErrorToast(
        'Не удалось создать статью',
        isApiError(response) ? response.error : undefined
      )

      return null
    }

    uiStore.createSuccessToast('Статья создана')
    setMode('view')
    await reloadArticles()

    return (
      articles.data.value.find((a) => a.id === response.data?.id)?.slug ?? null
    )
  }

  async function remove(): Promise<boolean> {
    if (!article.value?.id) {
      return false
    }

    uiStore.setLoading(true)

    const response = await SupportService.deleteArticle(article.value.id)

    uiStore.setLoading(false)

    if (isApiError(response)) {
      uiStore.createApiErrorToast('Не удалось удалить статью', response.error)

      return false
    }

    uiStore.createSuccessToast('Статья удалена')
    discardDraft()
    await reloadArticles()

    return true
  }

  return {
    category,
    articles: articles.data,
    isListLoading: articles.isLoading,
    listError: articles.error,
    article,
    isArticleLoading: articleRequest.isLoading,
    articleError: articleRequest.error,
    mode,
    setMode,
    loadArticles,
    reloadArticles,
    loadArticle,
    startCreate,
    discardDraft,
    hasChanges,
    cancelEdit,
    save,
    remove
  }
})

export { useHelpEditStore }
