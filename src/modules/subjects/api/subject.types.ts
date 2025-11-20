import type { ApiEntity } from '@/core/api/api.types'
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'

export interface SubjectEntity extends ApiEntity<'Subject'> {
  name: string
  color: string
}

export type UnsavedSubject = PossiblyUnsavedEntity<
  SubjectEntity,
  SubjectEntity['_entityName']
>
