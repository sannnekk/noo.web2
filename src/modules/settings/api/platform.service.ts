import { type ApiResponse, Api } from '@/core/api/api.utils'
import { reviveDates } from '@/core/api/serialization.utils'
import type { ChangelogRelease } from './platform.types'

const BASE_PATH = '/platform'

/**
 * The frontend changelog is generated into `public/` at release time, so it is
 * served as a static asset next to the app rather than by the API.
 */
const FRONTEND_CHANGELOG_PATH = `${import.meta.env.BASE_URL}changelog.json`

interface IPlatformService {
  /**
   * Fetches the API changelog, newest release first.
   *
   * @returns A promise that resolves to an ApiResponse containing the releases.
   */
  getApiChangelog(): Promise<ApiResponse<ChangelogRelease[]>>
  /**
   * Fetches the frontend changelog, newest release first.
   *
   * @returns A promise that resolves to an ApiResponse containing the releases.
   */
  getFrontendChangelog(): Promise<ApiResponse<ChangelogRelease[]>>
}

async function getApiChangelog(): Promise<ApiResponse<ChangelogRelease[]>> {
  return await Api.get(`${BASE_PATH}/changelog`)
}

async function getFrontendChangelog(): Promise<
  ApiResponse<ChangelogRelease[]>
> {
  try {
    const response = await fetch(FRONTEND_CHANGELOG_PATH, { cache: 'no-cache' })

    if (!response.ok) {
      return {
        error: {
          id: 'frontend-changelog',
          statusCode: response.status,
          name: 'Не удалось загрузить историю изменений',
          description: 'Файл истории изменений недоступен',
          payload: null
        }
      }
    }

    // Parsed by hand so the release dates become `Date` objects, the way the
    // API client would have revived them.
    const releases = JSON.parse(
      await response.text(),
      reviveDates
    ) as ChangelogRelease[]

    return { data: releases }
  } catch (error) {
    return {
      error: {
        id: 'frontend-changelog',
        statusCode: 0,
        name: 'Не удалось загрузить историю изменений',
        description: 'Файл истории изменений недоступен',
        payload: error
      }
    }
  }
}

export const PlatformService: IPlatformService = {
  getApiChangelog,
  getFrontendChangelog
}
