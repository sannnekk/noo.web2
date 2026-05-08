import { isApiError, type ApiResponse } from '@/core/api/api.utils'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { emptyRichText } from '@/core/utils/richtext.utils'
import type {
  PossiblyUnsavedEntity,
  UnsavedEntity
} from '@/core/utils/types.utils'
import { SnippetService } from '@/modules/assigned-works/api/snippet.service'
import type { SnippetEntity } from '@/modules/assigned-works/api/snippet.types'
import _ from 'lodash'
import { defineStore } from 'pinia'
import {
  computed,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
  type ShallowRef
} from 'vue'

type SnippetDraft = PossiblyUnsavedEntity<SnippetEntity, 'Snippet'>

interface SnippetSettingsStore {
  /**
   * The list of snippets owned by the current user.
   */
  list: UseApiRequestReturn<void, SnippetEntity[]>
  /**
   * The currently edited or newly created snippet draft. `null` when no
   * editor is open. Mutating the draft does not affect the persisted snippet
   * until `save()` succeeds.
   */
  draft: Ref<SnippetDraft | null>
  /**
   * JSON Patch generator bound to the draft when editing an existing snippet.
   * `null` for new drafts (which are created via POST instead).
   */
  patchGenerator: ShallowRef<PatchGenerator<SnippetEntity> | null>
  /**
   * Whether the editor is creating a new snippet rather than editing an
   * existing one.
   */
  isDraftNew: ComputedRef<boolean>
  /**
   * Whether the draft has unsaved changes compared to the loaded snippet.
   * Always `true` for a new draft.
   */
  hasUnsavedChanges: ComputedRef<boolean>
  /**
   * Persists the current draft (create or update depending on whether the
   * draft is new). Refreshes the list on success.
   */
  save: UseApiRequestReturn
  /**
   * Deletes a snippet by id and refreshes the list.
   */
  remove: UseApiRequestReturn<string>
  /**
   * Loads the list of snippets.
   */
  init: () => Promise<void>
  /**
   * Opens the editor with a fresh draft for a new snippet.
   */
  startCreate: () => void
  /**
   * Opens the editor with a draft cloned from an existing snippet.
   */
  startEdit: (snippet: SnippetEntity) => void
  /**
   * Closes the editor and discards the draft.
   */
  resetDraft: () => void
}

const useSnippetSettingsStore = defineStore(
  'settings:snippets',
  (): SnippetSettingsStore => {
    const uiStore = useGlobalUIStore()

    const draft = ref<SnippetDraft | null>(null)
    const patchGenerator = shallowRef<PatchGenerator<SnippetEntity> | null>(
      null
    )
    const changesCount = ref(0)

    const list = useApiRequest<void, SnippetEntity[]>(
      SnippetService.get,
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить сниппеты', error)
    )

    const isDraftNew = computed(() => !!draft.value && !draft.value.id)

    watch(
      draft,
      () => {
        changesCount.value = patchGenerator.value?.countChanges() ?? 0
      },
      { deep: true }
    )

    const hasUnsavedChanges = computed(
      () => isDraftNew.value || changesCount.value > 0
    )

    const save = useApiRequest<void, void>(
      async (): Promise<ApiResponse<void>> => {
        if (!draft.value) {
          return { data: undefined }
        }

        if (!draft.value.id) {
          const { _key: _localKey, ...rest } = draft.value
          const payload: UnsavedEntity<SnippetEntity, 'Snippet'> = {
            ...rest,
            _key: _localKey
          }

          const response = await SnippetService.create(payload)

          if (isApiError(response)) {
            return { error: response.error }
          }

          return { data: undefined }
        }

        if (!patchGenerator.value) {
          return { data: undefined }
        }

        return SnippetService.update(
          draft.value.id,
          patchGenerator.value.generate()
        )
      },
      async () => {
        uiStore.createSuccessToast('Сниппет сохранён')
        resetDraft()
        await list.execute()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось сохранить сниппет', error)
    )

    const remove = useApiRequest<string>(
      SnippetService.delete,
      async () => {
        uiStore.createSuccessToast('Сниппет удалён')
        await list.execute()
      },
      (error) => uiStore.createApiErrorToast('Не удалось удалить сниппет', error)
    )

    async function init(): Promise<void> {
      await list.execute()
    }

    function startCreate(): void {
      const fresh: SnippetDraft = {
        _entityName: 'Snippet',
        _key: uid(),
        name: '',
        content: emptyRichText()
      }

      draft.value = fresh
      patchGenerator.value = null
      changesCount.value = 0
    }

    function startEdit(snippet: SnippetEntity): void {
      const cloned: SnippetDraft = {
        ..._.cloneDeep(snippet),
        _key: uid()
      }

      draft.value = cloned
      patchGenerator.value = JsonPatchUtils.observe(
        cloned as unknown as SnippetEntity
      )
      changesCount.value = 0
    }

    function resetDraft(): void {
      draft.value = null
      patchGenerator.value = null
      changesCount.value = 0
    }

    return {
      list,
      draft,
      patchGenerator,
      isDraftNew,
      hasUnsavedChanges,
      save,
      remove,
      init,
      startCreate,
      startEdit,
      resetDraft
    }
  }
)

export { useSnippetSettingsStore }
