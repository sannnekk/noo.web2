import { useEventListener, useResizeObserver } from '@vueuse/core'
import { shallowRef, watch, type Ref, type ShallowRef } from 'vue'

export interface UseElementScrollbarReturn {
  scrollableToTop: ShallowRef<boolean>
  scrollableToBottom: ShallowRef<boolean>
}

function useElementScrollbar(
  elementRef: Readonly<ShallowRef<HTMLElement | null> | Ref<HTMLElement | null>>
): UseElementScrollbarReturn {
  const scrollableToTop = shallowRef<boolean>(false)
  const scrollableToBottom = shallowRef<boolean>(false)

  const offset = 10 // Offset to determine scrollable state

  const update = () => {
    const el = elementRef.value

    if (!el) {
      scrollableToTop.value = false
      scrollableToBottom.value = false

      return
    }

    scrollableToTop.value = el.scrollTop > offset
    scrollableToBottom.value =
      el.scrollTop + el.clientHeight < el.scrollHeight - offset
  }

  watch(elementRef, () => { update(); })

  useEventListener(elementRef, 'scroll', update)
  useResizeObserver(elementRef, update)

  return {
    scrollableToTop,
    scrollableToBottom
  }
}

export { useElementScrollbar }
