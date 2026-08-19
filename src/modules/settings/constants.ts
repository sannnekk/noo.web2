import type { UserRole } from '@/core/api/endpoints/auth.types'
import type {
  GoogleSheetsIntegrationRunState,
  GoogleSheetsIntegrationSchedule,
  GoogleSheetsIntegrationStatus,
  GoogleSheetsIntegrationType
} from './api/google-sheets.types'
import type { FontSize } from '@/core/api/endpoints/user-settings.types'
import type { Theme } from '@/core/composables/useTheme'

interface GoogleSheetsIntegrationTypeOption {
  label: string
  value: GoogleSheetsIntegrationType
  description: string
  /** Roles allowed to create this export. Mirrors the profile's AllowedRoles. */
  roles: UserRole[]
}

const googleSheetsIntegrationTypes: GoogleSheetsIntegrationTypeOption[] = [
  {
    label: 'Пользователи',
    value: 'users',
    description: 'Можно ограничить ролью, курсом и датой регистрации',
    roles: ['admin', 'teacher']
  },
  {
    label: 'Курсы',
    value: 'courses',
    description: 'Можно ограничить предметом и датой создания',
    roles: ['admin', 'teacher']
  },
  {
    label: 'Результаты опроса',
    value: 'poll-results',
    description: 'Все ответы на выбранный опрос, по колонке на вопрос',
    roles: ['admin', 'teacher']
  },
  {
    label: 'Работы учеников',
    value: 'assigned-works',
    description: 'Работы одного ученика или все работы куратора',
    roles: ['admin', 'teacher', 'mentor']
  }
]

const googleSheetsIntegrationTypeLabels: Record<
  GoogleSheetsIntegrationType,
  string
> = {
  users: 'Пользователи',
  courses: 'Курсы',
  'poll-results': 'Результаты опроса',
  'assigned-works': 'Работы учеников'
}

const googleSheetsIntegrationStatusLabels: Record<
  GoogleSheetsIntegrationStatus,
  string
> = {
  active: 'Активна',
  inactive: 'Отключена',
  error: 'Ошибка'
}

const googleSheetsIntegrationRunStateLabels: Record<
  GoogleSheetsIntegrationRunState,
  string
> = {
  idle: '',
  queued: 'В очереди',
  running: 'Выполняется'
}

const googleSheetsIntegrationSchedules: {
  label: string
  value: GoogleSheetsIntegrationSchedule
}[] = [
  { label: 'Вручную', value: 'manual' },
  { label: 'Каждый час', value: 'hourly' },
  { label: 'Каждый день', value: 'daily' },
  { label: 'Каждую неделю', value: 'weekly' }
]

const googleSheetsIntegrationScheduleLabels: Record<
  GoogleSheetsIntegrationSchedule,
  string
> = {
  manual: 'Вручную',
  hourly: 'Каждый час',
  daily: 'Каждый день',
  weekly: 'Каждую неделю'
}

const defaultGoogleSheetsSchedule: GoogleSheetsIntegrationSchedule = 'daily'

const userThemeOptions: { label: string; value: Theme }[] = [
  { label: 'Светлая', value: 'light' },
  { label: 'Тёмная', value: 'dark' },
  { label: 'Системная', value: 'system' }
]

const fontSizeOptions: { label: string; value: FontSize }[] = [
  { label: 'Маленький', value: 'small' },
  { label: 'Обычный', value: 'normal' },
  { label: 'Крупный', value: 'large' }
]

const fontSizeLabels: Record<FontSize, string> = {
  small: 'Маленький',
  normal: 'Обычный',
  large: 'Крупный'
}

export type { GoogleSheetsIntegrationTypeOption }

export {
  defaultGoogleSheetsSchedule,
  fontSizeLabels,
  fontSizeOptions,
  googleSheetsIntegrationRunStateLabels,
  googleSheetsIntegrationScheduleLabels,
  googleSheetsIntegrationSchedules,
  googleSheetsIntegrationStatusLabels,
  googleSheetsIntegrationTypeLabels,
  googleSheetsIntegrationTypes,
  userThemeOptions
}
