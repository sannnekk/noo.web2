import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import _ from 'lodash'
import { defineStore } from 'pinia'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { UserSettingsService } from '../api/user-settings.service'
import type {
  UpdateUserSettingsDto,
  UserSettingsDto
} from '../api/user-settings.types'
import { defaultFontSize, defaultUserTheme } from '../constants'

interface PersonalizationSettingsStore {
  /**
   * The current user's personalization settings as loaded from the backend.
   */
  settings: UseApiRequestReturn<void, UserSettingsDto>
  /**
   * Editable copy of the settings used by the form. Mutating this
   * draft does not affect the persisted values until `save()` succeeds.
   */
  draft: Ref<UserSettingsDto>
  /**
   * Persists the current draft. Refreshes settings on success.
   */
  save: UseApiRequestReturn
  /**
   * Whether the draft differs from the last loaded settings.
   */
  hasUnsavedChanges: ComputedRef<boolean>
  /**
   * Loads settings from the backend and resets the draft.
   */
  init: () => Promise<void>
  /**
   * Reverts the draft to the last loaded settings.
   */
  resetDraft: () => void
}

function getDefaults(): UserSettingsDto {
  return {
    theme: defaultUserTheme,
    fontSize: defaultFontSize
  }
}

const usePersonalizationSettingsStore = defineStore(
  'settings:personalization',
  (): PersonalizationSettingsStore => {
    const uiStore = useGlobalUIStore()

    const draft = ref<UserSettingsDto>(getDefaults())

    function bindDraft(value: UserSettingsDto): void {
      draft.value = {
        theme: value.theme ?? defaultUserTheme,
        fontSize: value.fontSize ?? defaultFontSize
      }
    }

    const settings = useApiRequest<void, UserSettingsDto>(
      UserSettingsService.get,
      (response) => {
        bindDraft(response.data)
      },
      (error) => {
        uiStore.createApiErrorToast(
          'Не удалось загрузить настройки персонализации',
          error
        )
      }
    )

    const save = useApiRequest(
      () => {
        const dto: UpdateUserSettingsDto = {
          theme: draft.value.theme,
          fontSize: draft.value.fontSize
        }

        return UserSettingsService.update(dto)
      },
      async () => {
        uiStore.createSuccessToast('Настройки сохранены')
        await settings.execute()
      },
      (error) => {
        uiStore.createApiErrorToast('Не удалось сохранить настройки', error)
      }
    )

    const hasUnsavedChanges = computed(() => {
      const loaded = settings.data.value

      if (!loaded) {
        return false
      }

      return !_.isEqual(
        {
          theme: loaded.theme ?? defaultUserTheme,
          fontSize: loaded.fontSize ?? defaultFontSize
        },
        draft.value
      )
    })

    async function init(): Promise<void> {
      await settings.execute()
    }

    function resetDraft(): void {
      if (!settings.data.value) {
        draft.value = getDefaults()

        return
      }

      bindDraft(settings.data.value)
    }

    return {
      settings,
      draft,
      save,
      hasUnsavedChanges,
      init,
      resetDraft
    }
  }
)

export { usePersonalizationSettingsStore }
