import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { PossiblyUnsavedEntity } from '@/core/utils/types.utils'

export interface SupportArticleEntity extends ApiEntity<'SupportArticle'> {
  slug: string
  title: string
  content: IRichText
  isActive: boolean
  category: SupportCategory
}

export type SupportCategory = 'courses' | 'payment' | 'works'

export type PossiblyUnsavedSupportArticle = PossiblyUnsavedEntity<
  SupportArticleEntity,
  'SupportArticle'
>
