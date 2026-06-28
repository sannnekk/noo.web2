import type { ParticipatingUserType } from './api/poll.types'

const participatingUserTypes: {
  label: string
  value: ParticipatingUserType
}[] = [
  { label: 'Пользователь', value: 'authenticated-user' },
  { label: 'Telegram', value: 'telegram-user' }
]

export { participatingUserTypes }
