import { type ApiResponse, Api } from '@/core/api/api.utils'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import type { UnsavedEntity } from '@/core/utils/types.utils'
import type { SnippetEntity } from './snippet.types'

const BASE_PATH = '/snippet'

interface ISnippetService {
  /**
   * Fetches a list of snippets for the authenticated user.
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
    snippet: UnsavedEntity<SnippetEntity, SnippetEntity['_entityName']>
  ): Promise<ApiResponse<{ id: string }>>
  /**
   * Updates an existing snippet using a JSON Patch document.
   *
   * @param snippetId The ID of the snippet to update.
   * @param patch JSON Patch document describing the changes.
   */
  update(
    snippetId: string,
    patch: JsonPatchDocument<SnippetEntity>
  ): Promise<ApiResponse>
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
  snippet: UnsavedEntity<SnippetEntity, SnippetEntity['_entityName']>
): Promise<ApiResponse<{ id: string }>> {
  return await Api.post(BASE_PATH, snippet)
}

async function update(
  snippetId: string,
  patch: JsonPatchDocument<SnippetEntity>
): Promise<ApiResponse> {
  return await Api.patch(`${BASE_PATH}/${snippetId}`, patch)
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
