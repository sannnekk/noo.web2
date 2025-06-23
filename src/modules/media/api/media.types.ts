import type { ApiEntity } from '@/core/api/api.types'

export interface MediaEntity extends ApiEntity {
  order: number
  hash: string | null
  path: string
  url: string
  name: string
  actualName: string | null
  extension: string
  size: number
}
