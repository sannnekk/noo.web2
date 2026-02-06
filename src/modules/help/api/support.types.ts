import type { ApiEntity } from '@/core/api/api.types'
import type { IRichText } from '@/core/utils/richtext.utils'

export interface SupportCategoryEntity extends ApiEntity<'SupportCategory'> {
  name: string
  isPinned: boolean
  isActive: boolean
  parentId?: string
  children: SupportCategoryEntity[]
  articles: SupportArticleEntity[]
}

export interface SupportArticleEntity extends ApiEntity<'SupportArticle'> {
  title: string
  content: IRichText
  isActive: boolean
  categoryId: string
}

export interface CreateSupportArticlePayload {
  title: string
  order: number
  content?: IRichText
  isActive?: boolean
  categoryId?: string
}

export interface CreateSupportCategoryPayload {
  name: string
  order: number
  isPinned?: boolean
  isActive?: boolean
  parentId?: string
}
