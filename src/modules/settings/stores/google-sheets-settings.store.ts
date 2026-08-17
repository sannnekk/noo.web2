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
  GoogleSheetsIntegrationEntity,
  UpdateGoogleSheetsIntegrationDto
} from '../api/google-sheets.types'

interface UpdatePayload {
  id: string
  changes: UpdateGoogleSheetsIntegrationDto
}

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
   * Changes an integration's name, schedule or enabled state.
   */
  update: UseApiRequestReturn<UpdatePayload>
  /**
   * Queues an integration to run. Refreshes the list on success.
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
        uiStore.createSuccessToast('Выгрузка создана')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось создать выгрузку', error)
    )

    const update = useApiRequest<UpdatePayload>(
      ({ id, changes }) => GoogleSheetsService.update(id, changes),
      async () => {
        uiStore.createSuccessToast('Выгрузка обновлена')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось обновить выгрузку', error)
    )

    const run = useApiRequest<string>(
      GoogleSheetsService.run,
      async () => {
        // The export runs in the background; the list picks up its progress
        // through the run state column.
        uiStore.createSuccessToast('Выгрузка поставлена в очередь')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось запустить выгрузку', error)
    )

    const remove = useApiRequest<string>(
      GoogleSheetsService.delete,
      async () => {
        uiStore.createSuccessToast('Выгрузка удалена')
        await search.reload()
      },
      (error) =>
        uiStore.createApiErrorToast('Не удалось удалить выгрузку', error)
    )

    return {
      search,
      create,
      update,
      run,
      remove
    }
  }
)

export { useGoogleSheetsSettingsStore }
