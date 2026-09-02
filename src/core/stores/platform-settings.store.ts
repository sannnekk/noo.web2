import { defineStore } from 'pinia'
import { computed, ref, shallowRef, type ComputedRef, type Ref } from 'vue'
import { PlatformSettingsService } from '../api/endpoints/platform-settings.service'
import type { PlatformSettings } from '../api/endpoints/platform-settings.types'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '../composables/useApiRequest'
import { JsonPatchUtils, type PatchGenerator } from '../utils/jsonpatch.utils'
import { useGlobalUIStore } from './global-ui.store'

interface PlatformSettingsStore {
  /**
   * The links and contacts as the API gave them, or `null` until it has.
   *
   * Nullable on purpose: there is no second copy of these values in the app, so
   * "not loaded yet" is a state components have to render rather than paper
   * over — a link with an empty href points at the current page.
   */
  settings: ComputedRef<PlatformSettings | null>
  /** The request itself, for a view that wants its loading and error state. */
  request: UseApiRequestReturn<void, PlatformSettings>
  /**
   * Editable copy for the admin form, bound once the settings are in. Mutating
   * it changes nothing until `save()` succeeds.
   */
  draft: Ref<PlatformSettings | null>
  hasUnsavedChanges: ComputedRef<boolean>
  save: UseApiRequestReturn
  /**
   * Loads the settings once per session. Repeated calls are no-ops, so any
   * component that needs them may ask without coordinating with the others.
   */
  load: () => Promise<void>
  /** Reloads regardless, for a retry after a failure. */
  reload: () => Promise<void>
  resetDraft: () => void
}

const usePlatformSettingsStore = defineStore(
  'platform:settings',
  (): PlatformSettingsStore => {
    const uiStore = useGlobalUIStore()

    const draft = ref<PlatformSettings | null>(null)
    const patchGenerator = shallowRef<PatchGenerator<PlatformSettings> | null>(
      null
    )
    const isLoaded = shallowRef(false)

    /**
     * Points the draft and its patch generator at a new baseline. The generator
     * observes the object the ref holds, so every later edit through `draft` is
     * part of the patch — and the baseline is what the next save diffs against.
     */
    function bindDraft(value: PlatformSettings): void {
      draft.value = { ...value }
      patchGenerator.value = JsonPatchUtils.observe(draft.value)
    }

    const request = useApiRequest<void, PlatformSettings>(
      PlatformSettingsService.get,
      (response) => {
        isLoaded.value = true
        bindDraft(response.data)
      }
      // Deliberately quiet on failure: this loads on every page for every
      // visitor, and the components that read it leave their links out until it
      // arrives. A toast here would be the first thing a signed-out visitor
      // sees when the API blinks.
    )

    const settings = computed<PlatformSettings | null>(() => request.data.value)

    const hasUnsavedChanges = computed(
      () => (patchGenerator.value?.countChanges() ?? 0) > 0
    )

    const save = useApiRequest(
      () =>
        PlatformSettingsService.update(patchGenerator.value?.generate() ?? []),
      async () => {
        uiStore.createSuccessToast('Настройки сохранены')
        await reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось сохранить настройки', error)
    )

    async function load(): Promise<void> {
      if (isLoaded.value || request.isLoading.value) {
        return
      }

      await request.execute()
    }

    async function reload(): Promise<void> {
      await request.execute()
    }

    function resetDraft(): void {
      if (request.data.value) {
        bindDraft(request.data.value)

        return
      }

      draft.value = null
      patchGenerator.value = null
    }

    return {
      settings,
      request,
      draft,
      hasUnsavedChanges,
      save,
      load,
      reload,
      resetDraft
    }
  }
)

/**
 * The platform's links and contacts, for the many components that only read
 * them. `null` until the API has answered — bind through `v-if` or `?.` so a
 * link is left out rather than rendered pointing nowhere.
 */
function usePlatformSettings(): ComputedRef<PlatformSettings | null> {
  const store = usePlatformSettingsStore()

  return computed(() => store.settings)
}

export { usePlatformSettings, usePlatformSettingsStore }
