import { isApiError } from '@/core/api/api.utils'
import { Pagination } from '@/core/utils/pagination.utils'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { SupportService } from '../api/support.service'
import type {
  SupportArticleEntity,
  SupportCategory
} from '../api/support.types'
import { helpCategories } from '../content'

/**
 * High enough to hold every article of a category, since the home page searches
 * over what it loaded rather than over an endpoint. See `searchArticles`.
 */
const ARTICLES_PER_CATEGORY = 200

/**
 * Backs the help home page's search and category counts: every article of every
 * category, loaded once and kept, so that leaving for an article and coming back
 * does not reload them.
 *
 * The requests go out together and a failure in one does not lose the others — a
 * category the API could not answer for simply shows no articles. The FAQ has a
 * store of its own, since managers see a longer list of it than readers do.
 */
const useHelpHomeStore = defineStore('help:home', () => {
  const articlesByCategory = ref<Record<string, SupportArticleEntity[]>>({})
  const isLoading = shallowRef(false)
  const hasFailed = shallowRef(false)
  const isLoaded = shallowRef(false)

  const articles = computed<SupportArticleEntity[]>(() =>
    helpCategories.flatMap(
      ({ category }) => articlesByCategory.value[category] ?? []
    )
  )

  function countIn(category: SupportCategory): number {
    return articlesByCategory.value[category]?.length ?? 0
  }

  async function load(force = false): Promise<void> {
    if (isLoading.value || (isLoaded.value && !force)) {
      return
    }

    isLoading.value = true
    hasFailed.value = false

    const articleResponses = await Promise.all(
      helpCategories.map(({ category }) =>
        SupportService.getArticlesByCategory(
          category,
          new Pagination(1, ARTICLES_PER_CATEGORY)
        )
      )
    )

    articlesByCategory.value = Object.fromEntries(
      helpCategories.map(({ category }, index) => {
        const response = articleResponses[index]

        if (isApiError(response) || !response.data) {
          hasFailed.value = true

          return [category, []]
        }

        return [category, response.data.filter((article) => article.isActive)]
      })
    )

    isLoaded.value = true
    isLoading.value = false
  }

  return {
    articles,
    isLoading,
    hasFailed,
    isLoaded,
    countIn,
    load
  }
})

export { useHelpHomeStore }
