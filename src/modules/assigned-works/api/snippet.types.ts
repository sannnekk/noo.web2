import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'

export interface SnippetEntity extends ApiEntity {
  name: string
  content: IRichText
}
