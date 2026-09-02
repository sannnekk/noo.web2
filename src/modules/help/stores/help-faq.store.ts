import { isApiError } from '@/core/api/api.utils'
import { useViewMode } from '@/core/composables/useViewMode'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { Pagination } from '@/core/utils/pagination.utils'
import _ from 'lodash'
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { SupportService } from '../api/support.service'
import type {
  PossiblyUnsavedSupportFaqItem,
  SupportFaqItemEntity
} from '../api/support.types'

/** The FAQ is a page section, not a list anyone pages through. */
const ITEMS_PER_PAGE = 100

/**
 * The frequently asked questions on the help home page, and the editing of them.
 *
 * One store for both, the way {@link useHelpEditStore} covers articles: the list
 * a manager edits is the list the page renders, so a save cannot leave the two
 * disagreeing. What is loaded depends on who is asking — a manager sees
 * unpublished questions, everyone else only the published ones.
 */
const useHelpFaqStore = defineStore('help:faq', () => {
  const uiStore = useGlobalUIStore()
  const { mode, setMode } = useViewMode('view')

  const items = ref<SupportFaqItemEntity[]>([])
  const isListLoading = shallowRef(false)
  const listFailed = shallowRef(false)
  const isLoaded = shallowRef(false)
  const isSaving = shallowRef(false)

  const draft = ref<PossiblyUnsavedSupportFaqItem | null>(null)
  const patchGenerator =
    shallowRef<PatchGenerator<PossiblyUnsavedSupportFaqItem> | null>(null)

  /**
   * @param canManage Whether unpublished questions belong in the list. Passed in
   *   rather than read from the permission policy here, so the store stays free
   *   of the session and testable without one.
   */
  async function load(canManage: boolean, force = false): Promise<void> {
    if (isListLoading.value || (isLoaded.value && !force)) {
      return
    }

    isListLoading.value = true
    listFailed.value = false

    const pagination = new Pagination(1, ITEMS_PER_PAGE)
    const response = canManage
      ? await SupportService.getFaqItems(pagination)
      : await SupportService.getActiveFaqItems(pagination)

    if (isApiError(response) || !response.data) {
      listFailed.value = true
      items.value = []
    } else {
      items.value = [...response.data].sort(
        (left, right) => left.order - right.order
      )
    }

    isLoaded.value = true
    isListLoading.value = false
  }

  function startCreate(): void {
    // New questions land at the end, where the reader meets them last and the
    // editor can move them up from.
    const lastOrder = items.value.reduce(
      (highest, item) => Math.max(highest, item.order),
      0
    )

    draft.value = SupportService.createFaqDraft(lastOrder + 1)
    patchGenerator.value = null
    setMode('create')
  }

  function startEdit(item: SupportFaqItemEntity): void {
    const cloned = _.cloneDeep(item) as PossiblyUnsavedSupportFaqItem

    draft.value = cloned
    patchGenerator.value = JsonPatchUtils.observe(cloned)
    setMode('edit')
  }

  function cancelEdit(): void {
    draft.value = null
    patchGenerator.value = null
    setMode('view')
  }

  function hasChanges(): boolean {
    if (mode.value === 'create') {
      return !!draft.value
    }

    return (patchGenerator.value?.countChanges() ?? 0) > 0
  }

  /** Whether the id belongs to the question currently open in the editor. */
  function isEditing(itemId: string): boolean {
    return mode.value === 'edit' && draft.value?.id === itemId
  }

  async function save(canManage: boolean): Promise<boolean> {
    if (!draft.value) {
      return false
    }

    return draft.value.id
      ? await updateItem(canManage)
      : await createItem(canManage)
  }

  async function createItem(canManage: boolean): Promise<boolean> {
    if (!draft.value) {
      return false
    }

    isSaving.value = true

    const response = await SupportService.createFaqItem(
      _.cloneDeep(draft.value)
    )

    isSaving.value = false

    if (isApiError(response) || !response.data) {
      uiStore.createApiErrorToast(
        'Не удалось создать вопрос',
        isApiError(response) ? response.error : undefined
      )

      return false
    }

    uiStore.createSuccessToast('Вопрос создан')
    cancelEdit()
    await load(canManage, true)

    return true
  }

  async function updateItem(canManage: boolean): Promise<boolean> {
    if (!draft.value?.id || !patchGenerator.value) {
      return false
    }

    isSaving.value = true

    const response = await SupportService.updateFaqItem(
      draft.value.id,
      patchGenerator.value.generate()
    )

    isSaving.value = false

    if (isApiError(response)) {
      uiStore.createApiErrorToast('Не удалось сохранить вопрос', response.error)

      return false
    }

    uiStore.createSuccessToast('Вопрос сохранён')
    cancelEdit()
    await load(canManage, true)

    return true
  }

  async function remove(
    item: SupportFaqItemEntity,
    canManage: boolean
  ): Promise<boolean> {
    isSaving.value = true

    const response = await SupportService.deleteFaqItem(item.id)

    isSaving.value = false

    if (isApiError(response)) {
      uiStore.createApiErrorToast('Не удалось удалить вопрос', response.error)

      return false
    }

    uiStore.createSuccessToast('Вопрос удалён')
    cancelEdit()
    await load(canManage, true)

    return true
  }

  return {
    items,
    isListLoading,
    listFailed,
    isLoaded,
    isSaving,
    mode,
    draft,
    load,
    startCreate,
    startEdit,
    cancelEdit,
    hasChanges,
    isEditing,
    save,
    remove
  }
})

export { useHelpFaqStore }
