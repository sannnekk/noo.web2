import type { UserRole } from '@/core/api/endpoints/auth.types'

const userRoles: { label: string; value: UserRole }[] = [
  { label: 'Ученик', value: 'student' },
  { label: 'Куратор', value: 'mentor' },
  { label: 'Ассистент', value: 'assistant' },
  { label: 'Преподаватель', value: 'teacher' },
  { label: 'Администратор', value: 'admin' }
]

export { userRoles }
