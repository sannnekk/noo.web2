import { useEventListener } from '@vueuse/core'
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * What is to be done about the changes that are about to be left behind.
 */
type UnsavedChangesDecision = 'stay' | 'discard' | 'save'

interface UseUnsavedChangesGuardOptions {
  /**
   * Whether anything would be lost right now. Asked at the moment the answer is
   * needed, so it can be worked out however the page likes — a patch generator,
   * a draft status, a plain flag.
   */
  hasChanges: () => boolean
  /**
   * Saves the changes and reports whether they went through. Leave it out where
   * the page cannot save on its own, and the question is only ever stay or
   * discard.
   */
  save?: () => Promise<boolean>
  /**
   * Whether saving is possible as things stand — a form that would not validate
   * has nothing to offer. Saving is on the table by default wherever
   * {@link UseUnsavedChangesGuardOptions.save} is given.
   */
  canSave?: () => boolean
}

interface UnsavedChangesGuard {
  /**
   * Whether the question is on screen. Bind the modal's `is-open` to it.
   */
  isAsking: ShallowRef<boolean>
  /**
   * Whether saving is on offer, and so whether the modal shows its save action.
   */
  canSave: ComputedRef<boolean>
  /**
   * Answers the question on screen. The modal calls it; only the first answer
   * counts, so a modal that both reports the choice and closes itself still
   * settles the question once.
   */
  decide: (decision: UnsavedChangesDecision) => void
  /**
   * Puts the question, and carries out the answer — saving included. Resolves
   * to whether whatever is waiting on it may go ahead.
   *
   * Navigating away from the page goes through it on its own; call it for the
   * page's own ways out of unsaved work, such as leaving edit mode.
   */
  confirm: () => Promise<boolean>
}

/**
 * Stands between unsaved work and everything that would throw it away.
 *
 * Navigating away from the page — a link, a redirect, the browser's back button
 * — is held up until the visitor answers. Reloading or closing the tab leaves
 * the app altogether, where the browser allows nothing but its own generic
 * prompt: no modal can be shown there and no wording chosen, so that one case is
 * covered by `beforeunload` and looks different by necessity.
 *
 * The page owns the modal that asks (see `noo-unsaved-changes-modal`) — the same
 * one it already shows when edits are dropped some other way, such as leaving
 * edit mode.
 */
function useUnsavedChangesGuard(
  options: UseUnsavedChangesGuardOptions
): UnsavedChangesGuard {
  const isAsking = shallowRef(false)

  let pendingDecision: {
    promise: Promise<UnsavedChangesDecision>
    decide: (decision: UnsavedChangesDecision) => void
  } | null = null

  const canSave = computed(
    () => !!options.save && (options.canSave?.() ?? true)
  )

  function ask(): Promise<UnsavedChangesDecision> {
    // Two ways out at once are the same question; both wait on the one answer.
    if (pendingDecision) {
      return pendingDecision.promise
    }

    let decide!: (decision: UnsavedChangesDecision) => void

    const promise = new Promise<UnsavedChangesDecision>((resolve) => {
      decide = resolve
    })

    pendingDecision = { promise, decide }
    isAsking.value = true

    return promise
  }

  function decide(decision: UnsavedChangesDecision): void {
    const pending = pendingDecision

    pendingDecision = null
    isAsking.value = false

    pending?.decide(decision)
  }

  async function confirm(): Promise<boolean> {
    if (!options.hasChanges()) {
      return true
    }

    const decision = await ask()

    if (decision === 'stay') {
      return false
    }

    if (decision === 'discard') {
      return true
    }

    // A save that fails leaves the changes where they are, so there is still
    // something to lose and the way out stays shut.
    return (await options.save?.()) ?? false
  }

  onBeforeRouteLeave(() => confirm())

  useEventListener(window, 'beforeunload', (event: BeforeUnloadEvent) => {
    if (!options.hasChanges()) {
      return
    }

    event.preventDefault()
  })

  return {
    isAsking,
    canSave,
    decide,
    confirm
  }
}

export {
  useUnsavedChangesGuard,
  type UnsavedChangesDecision,
  type UnsavedChangesGuard,
  type UseUnsavedChangesGuardOptions
}
