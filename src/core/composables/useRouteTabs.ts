import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface UseRouteTabsReturn<T> {
  /**
   * Active tab identifier
   */
  activeTab: Ref<T>
}

/**
 * Composable for managing route-based tabs.
 * Assumes that the route has a parameter named `tabId`.
 */
function useRouteTabs<T>(defaultTab?: T): UseRouteTabsReturn<T> {
  const route = useRoute()
  const router = useRouter()

  const activeTab = computed<T>({
    get() {
      const tabFromQuery = route.params.tabId

      if (typeof tabFromQuery === 'string') {
        return tabFromQuery as T
      }

      return defaultTab ?? ('-' as T)
    },
    set(newTab: T) {
      router.replace({
        params: {
          ...route.params,
          tabId: newTab as string
        }
      })
    }
  })

  return {
    activeTab
  }
}

export { useRouteTabs }
