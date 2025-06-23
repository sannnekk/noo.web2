import type { ApiEntity } from '../api/api.types'

export type PossiblyUnsavedEntity<T extends ApiEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: string
  createdAt?: Date
  updatedAt?: Date | null
} & {
  _key: string
}

export type UnsavedEntity<T extends ApiEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
> & {
  _key: string
}
