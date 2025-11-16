import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { UnsavedEntity } from '@/core/utils/types.utils'
import type { SnippetEntity } from './snippet.types'

const BASE_PATH = '/assigned-work'

interface ISnippetService {
  /**
   * Fetches a list of snippets for a mentor
   *
   * @returns A promise that resolves to an ApiResponse containing an array of Snippet objects.
   */
  get(): Promise<ApiResponse<SnippetEntity[]>>
  /**
   * Creates a new snippet
   *
   * @param snippet The snippet to be created.
   * @returns A promise that resolves to an ApiResponse containing the id of the created Snippet object.
   */
  create(
    snippet: UnsavedEntity<SnippetEntity>
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates an existing snippet
   *
   * @param snippet The snippet to be updated.
   */
  update(snippetId: string, snippet: SnippetEntity): Promise<ApiResponse>
  /**
   * Delete a snippet
   *
   * @param id The ID of the snippet to be deleted.
   */
  delete(id: string): Promise<ApiResponse>
}

async function get(): Promise<ApiResponse<SnippetEntity[]>> {
  return await Api.get(BASE_PATH)
}

async function create(
  snippet: UnsavedEntity<SnippetEntity>
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, snippet)
}

async function update(
  snippetId: string,
  snippet: SnippetEntity
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${snippetId}`, snippet)
}

async function deleteSnippet(id: string): Promise<ApiResponse> {
  return await Api.delete(`${BASE_PATH}/${id}`)
}

export const SnippetService: ISnippetService = {
  get,
  create,
  update,
  delete: deleteSnippet
}
