import type { ApiEntity } from '@/core/api/api.types'

export interface EntityTableColumnType<T extends ApiEntity> {
  title: string
  key: keyof T | string
  disableLink?: boolean
  width?: string
  converter?: (value: T[keyof T]) => string
}
