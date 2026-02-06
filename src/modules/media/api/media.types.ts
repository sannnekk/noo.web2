import type { ApiEntity } from '@/core/api/api.types'

export interface MediaEntity extends ApiEntity<'Media'> {
  order: number
  path: string
  name: string
  actualName: string | null
  extension: string
  size: number
  reason: string | null
  entityId?: string
  ownerId?: string
}
