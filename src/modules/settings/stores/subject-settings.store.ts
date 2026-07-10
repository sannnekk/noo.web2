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
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'
import { SubjectService } from '@/modules/subjects/api/subject.service'
import type {
  SubjectEntity,
  UnsavedSubject
} from '@/modules/subjects/api/subject.types'
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

type SubjectDraft = PossiblyUnsavedEntity<SubjectEntity, 'Subject'>

const DEFAULT_SUBJECT_COLOR = '#4caf50'

interface SubjectSettingsStore {
  /**
   * The list of all subjects.
   */
  list: UseApiRequestReturn<void, SubjectEntity[]>
  /**
   * The currently edited or newly created subject draft. `null` when no
   * editor is open. Mutating the draft does not affect the persisted subject
   * until `save()` succeeds.
   */
  draft: Ref<SubjectDraft | null>
  /**
   * JSON Patch generator bound to the draft when editing an existing subject.
   * `null` for new drafts (which are created via POST instead).
   */
  patchGenerator: ShallowRef<PatchGenerator<SubjectEntity> | null>
  /**
   * Whether the editor is creating a new subject rather than editing an
   * existing one.
   */
  isDraftNew: ComputedRef<boolean>
  /**
   * Whether the draft has unsaved changes compared to the loaded subject.
   * Always `true` for a new draft.
   */
  hasUnsavedChanges: ComputedRef<boolean>
  /**
   * Persists the current draft (create or update depending on whether the
   * draft is new). Refreshes the list on success.
   */
  save: UseApiRequestReturn
  /**
   * Loads the list of subjects.
   */
  init: () => Promise<void>
  /**
   * Opens the editor with a fresh draft for a new subject.
   */
  startCreate: () => void
  /**
   * Opens the editor with a draft cloned from an existing subject.
   */
  startEdit: (subject: SubjectEntity) => void
  /**
   * Closes the editor and discards the draft.
   */
  resetDraft: () => void
}

const useSubjectSettingsStore = defineStore(
  'settings:subjects',
  (): SubjectSettingsStore => {
    const uiStore = useGlobalUIStore()

    const draft = ref<SubjectDraft | null>(null)
    const patchGenerator = shallowRef<PatchGenerator<SubjectEntity> | null>(
      null
    )
    const changesCount = ref(0)

    const list = useApiRequest<void, SubjectEntity[]>(
      () => SubjectService.get(),
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить предметы', error)
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
          const payload: UnsavedSubject = _.cloneDeep(draft.value)

          const response = await SubjectService.create(payload)

          if (isApiError(response)) {
            return { error: response.error }
          }

          return { data: undefined }
        }

        if (!patchGenerator.value) {
          return { data: undefined }
        }

        return SubjectService.update(
          draft.value.id,
          patchGenerator.value.generate()
        )
      },
      async () => {
        uiStore.createSuccessToast('Предмет сохранён')
        resetDraft()
        await list.execute()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось сохранить предмет', error)
    )

    async function init(): Promise<void> {
      await list.execute()
    }

    function startCreate(): void {
      const fresh: SubjectDraft = {
        _entityName: 'Subject',
        _key: uid(),
        name: '',
        color: DEFAULT_SUBJECT_COLOR
      }

      draft.value = fresh
      patchGenerator.value = null
      changesCount.value = 0
    }

    function startEdit(subject: SubjectEntity): void {
      const cloned: SubjectDraft = {
        ..._.cloneDeep(subject),
        _key: uid()
      }

      draft.value = cloned
      patchGenerator.value = JsonPatchUtils.observe(
        cloned as unknown as SubjectEntity
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
      init,
      startCreate,
      startEdit,
      resetDraft
    }
  }
)

export { useSubjectSettingsStore }
