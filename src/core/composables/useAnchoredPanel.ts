import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type CSSProperties,
  type Ref,
  type ShallowRef
} from 'vue'

interface UseAnchoredPanelOptions {
  /** The element the panel hangs from. */
  anchor: Readonly<Ref<HTMLElement | null>>
  /** The panel itself, measured to decide which way it opens. */
  panel: Readonly<Ref<HTMLElement | null>>
  /** Whether it is showing. Closed by anything that moves the anchor. */
  isOpen: Ref<boolean>
  /** Which edge of the anchor the panel lines up with. */
  align?: 'left' | 'right'
}

interface UseAnchoredPanelReturn {
  /** Bind to the panel's `style`. */
  style: ShallowRef<CSSProperties>
  /** Measures and places the panel. Called on opening; call it again after the contents change. */
  update: () => Promise<void>
}

const GAP = 4

/**
 * Places a panel that has been teleported out of the document flow against the
 * element it belongs to.
 *
 * Teleporting is what makes this necessary. A panel positioned inside its own
 * corner of the page is clipped by any ancestor that hides its overflow — the
 * header is one, so a shortcuts panel drawn in place would be cut off at its
 * edge. Leaving the flow escapes the clip but also loses the anchor, so the
 * position is worked out from the anchor's rectangle instead, and the panel
 * flips above it where there is no room below.
 */
function useAnchoredPanel(
  options: UseAnchoredPanelOptions
): UseAnchoredPanelReturn {
  const style = shallowRef<CSSProperties>({})

  function position(): void {
    const anchorEl = options.anchor.value

    if (!anchorEl) {
      return
    }

    const rect = anchorEl.getBoundingClientRect()
    const panelHeight = options.panel.value?.offsetHeight ?? 0
    const opensUpwards =
      panelHeight > 0 &&
      rect.bottom + GAP + panelHeight > window.innerHeight &&
      rect.top - GAP - panelHeight > 0

    style.value = {
      position: 'fixed',
      top: opensUpwards
        ? `${rect.top - GAP - panelHeight}px`
        : `${rect.bottom + GAP}px`,
      ...(options.align === 'right'
        ? { right: `${window.innerWidth - rect.right}px` }
        : { left: `${rect.left}px` })
    }
  }

  async function update(): Promise<void> {
    position()

    // The panel has to be on the page before its height can say which way it opens.
    await nextTick()
    position()
  }

  watch(options.isOpen, (opened) => {
    if (opened) {
      update()
    }
  })

  // A fixed panel does not follow its anchor, so anything that moves the anchor
  // closes it rather than leaving it stranded mid-page.
  function onViewportChange(): void {
    if (options.isOpen.value) {
      options.isOpen.value = false
    }
  }

  onMounted(() => {
    // Capture phase, so scrolling any container counts, not only the page itself.
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
  })

  return { style, update }
}

export {
  useAnchoredPanel,
  type UseAnchoredPanelOptions,
  type UseAnchoredPanelReturn
}
