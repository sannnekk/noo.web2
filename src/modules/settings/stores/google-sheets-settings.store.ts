import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useSearch, type UseSearchReturn } from '@/core/composables/useSearch'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { GoogleSheetsService } from '../api/google-sheets.service'
import type {
  CreateGoogleSheetsIntegrationDto,
  GoogleSheetsIntegrationEntity
} from '../api/google-sheets.types'

interface GoogleSheetsSettingsStore {
  /**
   * Paginated, searchable list of Google Sheets integrations.
   */
  search: UseSearchReturn<GoogleSheetsIntegrationEntity>
  /**
   * Creates a new integration. Refreshes the list on success.
   */
  create: UseApiRequestReturn<CreateGoogleSheetsIntegrationDto, { id: string }>
  /**
   * Triggers an integration to run immediately. Refreshes the list on success.
   */
  run: UseApiRequestReturn<string>
  /**
   * Deletes an integration. Refreshes the list on success.
   */
  remove: UseApiRequestReturn<string>
}

const useGoogleSheetsSettingsStore = defineStore(
  'settings:google-sheets',
  (): GoogleSheetsSettingsStore => {
    const uiStore = useGlobalUIStore()

    const search = useSearch<GoogleSheetsIntegrationEntity>(
      GoogleSheetsService.get
    )

    const create = useApiRequest<
      CreateGoogleSheetsIntegrationDto,
      { id: string }
    >(
      GoogleSheetsService.create,
      async () => {
        uiStore.createSuccessToast('Интеграция создана')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось создать интеграцию', error)
    )

    const run = useApiRequest<string>(
      GoogleSheetsService.run,
      async () => {
        uiStore.createSuccessToast('Запуск интеграции инициирован')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось запустить интеграцию', error)
    )

    const remove = useApiRequest<string>(
      GoogleSheetsService.delete,
      async () => {
        uiStore.createSuccessToast('Интеграция удалена')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось удалить интеграцию', error)
    )

    return {
      search,
      create,
      run,
      remove
    }
  }
)

export { useGoogleSheetsSettingsStore }
