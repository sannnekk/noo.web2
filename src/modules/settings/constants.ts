import type {
  GoogleSheetsIntegrationStatus,
  GoogleSheetsIntegrationType
} from './api/google-sheets.types'

const googleSheetsIntegrationTypes: {
  label: string
  value: GoogleSheetsIntegrationType
}[] = [
  { label: 'Пользователи курса', value: 'user-course' },
  { label: 'Работы пользователя', value: 'user-work' },
  { label: 'Пользователи по роли', value: 'user-role' },
  { label: 'Результаты опроса', value: 'poll-results' }
]

const googleSheetsIntegrationTypeLabels: Record<
  GoogleSheetsIntegrationType,
  string
> = {
  'user-course': 'Пользователи курса',
  'user-work': 'Работы пользователя',
  'user-role': 'Пользователи по роли',
  'poll-results': 'Результаты опроса'
}

const googleSheetsIntegrationStatusLabels: Record<
  GoogleSheetsIntegrationStatus,
  string
> = {
  active: 'Активна',
  inactive: 'Неактивна',
  error: 'Ошибка'
}

const googleSheetsIntegrationSelectorMeta: Record<
  GoogleSheetsIntegrationType,
  { placeholder: string; tooltip: string }
> = {
  'user-course': {
    placeholder: 'ID курса',
    tooltip: 'ID курса, пользователей которого нужно экспортировать'
  },
  'user-work': {
    placeholder: 'ID пользователя',
    tooltip: 'ID пользователя, работы которого нужно экспортировать'
  },
  'user-role': {
    placeholder: 'Название роли',
    tooltip: 'Роль, пользователей которой нужно экспортировать'
  },
  'poll-results': {
    placeholder: 'ID опроса',
    tooltip: 'ID опроса, результаты которого нужно экспортировать'
  }
}

const defaultGoogleSheetsCronPattern = '0 */6 * * *'

export {
  defaultGoogleSheetsCronPattern,
  googleSheetsIntegrationSelectorMeta,
  googleSheetsIntegrationStatusLabels,
  googleSheetsIntegrationTypeLabels,
  googleSheetsIntegrationTypes
}
