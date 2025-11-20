import type { ApiEntity } from '@/core/api/api.types'
import type { UserRole } from '@/core/api/endpoints/auth.types'

export interface UserEntity extends ApiEntity<'User'> {
  username: string
  email: string
  name: string
  telegramId: string | null
  telegramUsername: string | null
  role: UserRole
  isBlocked: boolean
  isVerified: boolean
}
