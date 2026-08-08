import type { UserRole } from '@/core/api/endpoints/auth.types'
import type {
  UserHistoryPerspective,
  UserHistoryType
} from './api/user-history.types'

const userRoles: { label: string; value: UserRole }[] = [
  { label: 'Ученик', value: 'student' },
  { label: 'Куратор', value: 'mentor' },
  { label: 'Ассистент', value: 'assistant' },
  { label: 'Преподаватель', value: 'teacher' },
  { label: 'Администратор', value: 'admin' }
]

const userHistoryTypes: { label: string; value: UserHistoryType }[] = [
  { label: 'Регистрация', value: 'registered' },
  { label: 'Email подтверждён', value: 'email-confirmed' },
  { label: 'Email изменён', value: 'email-changed' },
  { label: 'Пароль изменён', value: 'password-changed' },
  { label: 'Пароль восстановлен', value: 'password-reset' },
  { label: 'Профиль обновлён', value: 'profile-updated' },
  { label: 'Роль изменена', value: 'role-changed' },
  { label: 'Заблокирован', value: 'blocked' },
  { label: 'Разблокирован', value: 'unblocked' },
  { label: 'Верифицирован', value: 'verified' },
  { label: 'Добавлен на курс', value: 'added-to-course' },
  { label: 'Удалён с курса', value: 'removed-from-course' },
  { label: 'Назначен куратор', value: 'mentor-assigned' },
  { label: 'Куратор откреплён', value: 'mentor-unassigned' },
  { label: 'Работа выдана', value: 'work-assigned' },
  { label: 'Работа сдана', value: 'work-solved' },
  { label: 'Работа проверена', value: 'work-checked' },
  { label: 'Работа на перепроверке', value: 'work-sent-on-recheck' },
  { label: 'Работа на доработке', value: 'work-sent-on-resolve' }
]

const userHistoryTypeLabels = new Map(
  userHistoryTypes.map(({ label, value }) => [value, label])
)

const userHistoryPerspectives: {
  label: string
  value: UserHistoryPerspective
}[] = [
  { label: 'Действия над пользователем', value: 'subject' },
  { label: 'Действия пользователя', value: 'actor' }
]

export {
  userRoles,
  userHistoryTypes,
  userHistoryTypeLabels,
  userHistoryPerspectives
}
