import { computed, type ComputedRef } from "vue";
import { useRoute } from "vue-router";

interface UsePageUrlReturn {
  currentPageUrl: ComputedRef<string>;
}

function usePageUrl(): UsePageUrlReturn {
  const route = useRoute()

  const currentPageUrl = computed(() => {
    return window.location.origin + route.path
  })

  return {
    currentPageUrl,
  }
}

export { usePageUrl };

