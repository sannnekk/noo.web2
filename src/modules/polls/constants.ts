import type { FileKind } from '@/components/files/file-kind.utils'
import type { ParticipatingUserType, PollQuestionType } from './api/poll.types'
import type { PollFileTypeGroup } from './types'

const participatingUserTypes: {
  label: string
  value: ParticipatingUserType
}[] = [
  { label: 'Пользователь', value: 'authenticated-user' },
  { label: 'Telegram', value: 'telegram-user' }
]

const pollQuestionTypes: {
  label: string
  value: PollQuestionType
  color: string
}[] = [
  { label: 'Текст', value: 'text', color: 'var(--lila)' },
  { label: 'Число', value: 'number', color: 'var(--secondary)' },
  { label: 'Галочка', value: 'checkbox', color: 'var(--success)' },
  { label: 'Дата', value: 'date', color: 'var(--telegram)' },
  { label: 'Дата и время', value: 'date-time', color: 'var(--telegram)' },
  { label: 'Один выбор', value: 'single-choice', color: 'var(--warning)' },
  {
    label: 'Множественный выбор',
    value: 'multiple-choice',
    color: 'var(--warning)'
  },
  { label: 'Рейтинг', value: 'rating', color: 'var(--primary)' },
  { label: 'Файлы', value: 'files', color: 'var(--danger)' }
]

const pollFileSizeOptions: { label: string; value: number }[] = [
  { label: '1 МБ', value: 1024 * 1024 },
  { label: '5 МБ', value: 5 * 1024 * 1024 },
  { label: '10 МБ', value: 10 * 1024 * 1024 },
  { label: '50 МБ', value: 50 * 1024 * 1024 }
]

const pollFileTypeGroups: {
  label: string
  value: PollFileTypeGroup
  mimeTypes: string[]
  /** The kind the file uploader knows this group as. */
  kind: FileKind
}[] = [
  {
    label: 'Изображения',
    value: 'images',
    mimeTypes: ['image/jpeg', 'image/png'],
    kind: 'image'
  },
  {
    label: 'Документы',
    value: 'documents',
    mimeTypes: ['application/pdf'],
    kind: 'pdf'
  }
]

/**
 * The most files a `files` question can ask for. Mirrors the API's own ceiling,
 * which turns away an answer that goes over it.
 */
const POLL_MAX_FILE_COUNT = 10

export {
  participatingUserTypes,
  POLL_MAX_FILE_COUNT,
  pollFileSizeOptions,
  pollFileTypeGroups,
  pollQuestionTypes
}
