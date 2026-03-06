import { computed, reactive } from 'vue'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'

interface EntityDraft<T extends object> {
  entity: T
  patchGenerator: PatchGenerator<T>
  isNew: boolean
  isDeleted: boolean
}

interface SetEntityDraftOptions {
  isNew?: boolean
}

interface UseEntityDraftsOptions {
  normalizeValue?: (key: string, value: unknown) => unknown
}

function useEntityDrafts<T extends object>(
  options: UseEntityDraftsOptions = {}
) {
  const drafts = reactive<Record<string, EntityDraft<T>>>({})

  function setDraft(
    key: string,
    entity: T,
    { isNew = false }: SetEntityDraftOptions = {}
  ): EntityDraft<T> {
    const draft: EntityDraft<T> = {
      entity,
      patchGenerator: JsonPatchUtils.observe(entity, options.normalizeValue),
      isNew,
      isDeleted: false
    }

    drafts[key] = draft

    return draft
  }

  function getDraft(key: string): EntityDraft<T> | null {
    return drafts[key] ?? null
  }

  function removeDraft(key: string): void {
    delete drafts[key]
  }

  function clear(): void {
    for (const key of Object.keys(drafts)) {
      removeDraft(key)
    }
  }

  function markDeleted(key: string): void {
    const draft = drafts[key]

    if (!draft) {
      return
    }

    draft.isDeleted = true
  }

  function unmarkDeleted(key: string): void {
    const draft = drafts[key]

    if (!draft) {
      return
    }

    draft.isDeleted = false
  }

  function resetDraftBaseline(key: string): void {
    const draft = drafts[key]

    if (!draft) {
      return
    }

    draft.patchGenerator = JsonPatchUtils.observe(
      draft.entity,
      options.normalizeValue
    )
    draft.isNew = false
  }

  function countChanges(key: string): number {
    const draft = drafts[key]

    if (!draft || draft.isDeleted) {
      return 0
    }

    return draft.patchGenerator.countChanges()
  }

  function hasChanges(key: string): boolean {
    const draft = drafts[key]

    if (!draft) {
      return false
    }

    return draft.isDeleted || draft.isNew || countChanges(key) > 0
  }

  const hasAnyChanges = computed(() =>
    Object.keys(drafts).some((key) => hasChanges(key))
  )

  return {
    drafts,
    getDraft,
    setDraft,
    removeDraft,
    clear,
    markDeleted,
    unmarkDeleted,
    resetDraftBaseline,
    countChanges,
    hasChanges,
    hasAnyChanges
  }
}

export {
  useEntityDrafts,
  type EntityDraft,
  type SetEntityDraftOptions,
  type UseEntityDraftsOptions
}
