import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { uid } from '@/core/utils/id.utils'
import type { IPagination } from '@/core/utils/pagination.utils'
import { emptyRichText } from '@/core/utils/richtext.utils'
import type {
  PossiblyUnsavedSupportArticle,
  PossiblyUnsavedSupportFaqItem,
  SupportArticleEntity,
  SupportCategory,
  SupportFaqItemEntity
} from './support.types'

const BASE_PATH = '/support'

interface ISupportService {
  /**
   * Creates a local draft for a new support article in the given category.
   *
   * @param category The category the new article belongs to.
   */
  createDraft(category: SupportCategory): PossiblyUnsavedSupportArticle
  /**
   * Retrieves support articles by category. Shaped for `useSearch`: the
   * pagination it passes is merged with the category filter.
   *
   * @param category The category of articles to fetch.
   * @param pagination Pagination passed by `useSearch`.
   * @returns A promise that resolves to an ApiResponse containing an array of SupportArticleEntity objects.
   */
  getArticlesByCategory(
    category: SupportCategory,
    pagination?: IPagination
  ): Promise<ApiResponse<SupportArticleEntity[]>>
  /**
   * Retrieves a support article by its slug
   *
   * @param articleSlug The slug of the article to fetch.
   * @returns A promise that resolves to an ApiResponse containing the SupportArticleEntity object.
   */
  getArticleBySlug(
    articleSlug: string
  ): Promise<ApiResponse<SupportArticleEntity>>
  /**
   * Creates a new support article
   *
   * @param article The article object to create
   * @returns ID of the article created, in a Promise
   */
  createArticle(
    article: PossiblyUnsavedSupportArticle
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates a support article using JSONPatchDocument
   *
   * @param articleId ID of the article to update
   * @param patch A JSONPatchDocument to use for update
   */
  updateArticle(
    articleId: string,
    patch: JsonPatchDocument<PossiblyUnsavedSupportArticle>
  ): Promise<ApiResponse>
  /**
   * Deletes a support article
   *
   * @param articleId The ID of the article to delete.
   */
  deleteArticle(articleId: string): Promise<ApiResponse>
  /**
   * Creates a local draft for a new FAQ item.
   *
   * @param order Where the item sits among the others.
   */
  createFaqDraft(order: number): PossiblyUnsavedSupportFaqItem
  /**
   * Retrieves the frequently asked questions.
   *
   * @param pagination Pagination and filters for the request.
   */
  getFaqItems(
    pagination?: IPagination
  ): Promise<ApiResponse<SupportFaqItemEntity[]>>
  /**
   * Retrieves the published frequently asked questions, for the help page.
   *
   * Filtered by the API rather than in the browser, so an unpublished answer is
   * never sent to a reader who is not allowed to see it yet.
   *
   * @param pagination Pagination for the request.
   */
  getActiveFaqItems(
    pagination?: IPagination
  ): Promise<ApiResponse<SupportFaqItemEntity[]>>
  /**
   * Creates a new FAQ item
   *
   * @param item The item to create
   * @returns ID of the item created, in a Promise
   */
  createFaqItem(
    item: PossiblyUnsavedSupportFaqItem
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates a FAQ item using a JSONPatchDocument
   *
   * @param itemId ID of the item to update
   * @param patch A JSONPatchDocument to use for update
   */
  updateFaqItem(
    itemId: string,
    patch: JsonPatchDocument<PossiblyUnsavedSupportFaqItem>
  ): Promise<ApiResponse>
  /**
   * Deletes a FAQ item
   *
   * @param itemId The ID of the item to delete.
   */
  deleteFaqItem(itemId: string): Promise<ApiResponse>
}

function createDraft(category: SupportCategory): PossiblyUnsavedSupportArticle {
  return {
    _entityName: 'SupportArticle',
    _key: uid(),
    slug: '',
    title: 'Новая статья',
    content: emptyRichText(),
    isActive: true,
    category
  }
}

async function getArticlesByCategory(
  category: SupportCategory,
  pagination?: IPagination
): Promise<ApiResponse<SupportArticleEntity[]>> {
  const query = pagination?.toQuery() ?? new URLSearchParams()

  query.set('category', category)

  return await Api.get(`${BASE_PATH}/article`, query)
}

async function getArticleBySlug(
  articleSlug: string
): Promise<ApiResponse<SupportArticleEntity>> {
  return await Api.get(`${BASE_PATH}/article/${articleSlug}`)
}

async function createArticle(
  article: PossiblyUnsavedSupportArticle
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(`${BASE_PATH}/article`, article)
}

async function updateArticle(
  articleId: string,
  patch: JsonPatchDocument<PossiblyUnsavedSupportArticle>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/article/${articleId}`, patch)
}

async function deleteArticle(articleId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/article/${articleId}`)
}

function createFaqDraft(order: number): PossiblyUnsavedSupportFaqItem {
  return {
    _entityName: 'SupportFaqItem',
    _key: uid(),
    order,
    question: 'Новый вопрос',
    answer: emptyRichText(),
    isActive: true,
    category: null
  }
}

async function getFaqItems(
  pagination?: IPagination
): Promise<ApiResponse<SupportFaqItemEntity[]>> {
  return await Api.get(`${BASE_PATH}/faq`, pagination?.toQuery())
}

async function getActiveFaqItems(
  pagination?: IPagination
): Promise<ApiResponse<SupportFaqItemEntity[]>> {
  const query = pagination?.toQuery() ?? new URLSearchParams()

  query.set('isActive', 'true')

  return await Api.get(`${BASE_PATH}/faq`, query)
}

async function createFaqItem(
  item: PossiblyUnsavedSupportFaqItem
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(`${BASE_PATH}/faq`, item)
}

async function updateFaqItem(
  itemId: string,
  patch: JsonPatchDocument<PossiblyUnsavedSupportFaqItem>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/faq/${itemId}`, patch)
}

async function deleteFaqItem(itemId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/faq/${itemId}`)
}

export const SupportService: ISupportService = {
  createDraft,
  getArticlesByCategory,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  createFaqDraft,
  getFaqItems,
  getActiveFaqItems,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem
}
