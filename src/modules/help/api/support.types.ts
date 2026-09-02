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

/**
 * One question and its answer on the help home page.
 *
 * Not a short article: it is read where it stands, in an accordion, and only
 * points at an article for the rest. The category is optional — "забыл пароль"
 * belongs to none in particular — and an item without one carries no link on.
 */
export interface SupportFaqItemEntity extends ApiEntity<'SupportFaqItem'> {
  order: number
  question: string
  answer: IRichText
  isActive: boolean
  category: SupportCategory | null
}

export type PossiblyUnsavedSupportArticle = PossiblyUnsavedEntity<
  SupportArticleEntity,
  'SupportArticle'
>

export type PossiblyUnsavedSupportFaqItem = PossiblyUnsavedEntity<
  SupportFaqItemEntity,
  'SupportFaqItem'
>
