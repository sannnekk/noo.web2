import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type {
  CreateSupportArticlePayload,
  CreateSupportCategoryPayload,
  SupportArticleEntity,
  SupportCategoryEntity
} from './support.types'

const BASE_PATH = '/support'

interface ISupportService {
  /**
   * Retrieves a tree of support categories
   *
   * @returns A promise that resolves to an ApiResponse containing an array of SupportCategoryEntity objects.
   */
  getCategories(): Promise<ApiResponse<SupportCategoryEntity[]>>
  /**
   * Retrieves a support article by its ID
   *
   * @param articleId The ID of the article to fetch.
   * @returns A promise that resolves to an ApiResponse containing the SupportArticleEntity object.
   */
  getArticleById(articleId: string): Promise<ApiResponse<SupportArticleEntity>>
  /**
   * Creates a new support article
   *
   * @param article The article object to create
   * @returns ID of the article created, in a Promise
   */
  createArticle(
    article: CreateSupportArticlePayload
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates a support article using JSONPatchDocument
   *
   * @param articleId ID of the article to update
   * @param patch A JSONPatchDocument to use for update
   */
  updateArticle(
    articleId: string,
    patch: JsonPatchDocument<SupportArticleEntity>
  ): Promise<ApiResponse>
  /**
   * Deletes a support article
   *
   * @param articleId The ID of the article to delete.
   */
  deleteArticle(articleId: string): Promise<ApiResponse>
  /**
   * Creates a new support category
   *
   * @param category The category object to create
   * @returns ID of the category created, in a Promise
   */
  createCategory(
    category: CreateSupportCategoryPayload
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates a support category using JSONPatchDocument
   *
   * @param categoryId ID of the category to update
   * @param patch A JSONPatchDocument to use for update
   */
  updateCategory(
    categoryId: string,
    patch: JsonPatchDocument<SupportCategoryEntity>
  ): Promise<ApiResponse>
  /**
   * Deletes a support category
   *
   * @param categoryId The ID of the category to delete.
   */
  deleteCategory(categoryId: string): Promise<ApiResponse>
}

async function getCategories(): Promise<ApiResponse<SupportCategoryEntity[]>> {
  return await Api.get(BASE_PATH)
}

async function getArticleById(
  articleId: string
): Promise<ApiResponse<SupportArticleEntity>> {
  return await Api.get(`${BASE_PATH}/article/${articleId}`)
}

async function createArticle(
  article: CreateSupportArticlePayload
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(`${BASE_PATH}/article`, article)
}

async function updateArticle(
  articleId: string,
  patch: JsonPatchDocument<SupportArticleEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/article/${articleId}`, patch)
}

async function deleteArticle(articleId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/article/${articleId}`)
}

async function createCategory(
  category: CreateSupportCategoryPayload
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(`${BASE_PATH}/category`, category)
}

async function updateCategory(
  categoryId: string,
  patch: JsonPatchDocument<SupportCategoryEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/category/${categoryId}`, patch)
}

async function deleteCategory(categoryId: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/category/${categoryId}`)
}

export const SupportService: ISupportService = {
  getCategories,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  createCategory,
  updateCategory,
  deleteCategory
}
