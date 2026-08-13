import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

/**
 * The composable hooks itself onto the router and onto the window; both are
 * captured here so the tests can play the part of the navigation and of the
 * browser closing the tab.
 */
let onRouteLeave: (() => Promise<boolean>) | null = null
let onBeforeUnload: ((event: BeforeUnloadEvent) => void) | null = null

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: (guard: () => Promise<boolean>) => {
    onRouteLeave = guard
  }
}))

vi.mock('@vueuse/core', () => ({
  useEventListener: (
    _target: unknown,
    _event: string,
    listener: (event: BeforeUnloadEvent) => void
  ) => {
    onBeforeUnload = listener
  }
}))

function unloadEvent(): BeforeUnloadEvent {
  return { preventDefault: vi.fn() } as unknown as BeforeUnloadEvent
}

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    onRouteLeave = null
    onBeforeUnload = null
  })

  test('should let a clean page go without asking', async () => {
    const guard = useUnsavedChangesGuard({ hasChanges: () => false })

    await expect(guard.confirm()).resolves.toBe(true)
    expect(guard.isAsking.value).toBe(false)
  })

  test('should hold the way out open until the question is answered', async () => {
    const guard = useUnsavedChangesGuard({ hasChanges: () => true })

    const answered = vi.fn()
    const decision = guard.confirm()

    decision.then(answered)
    await Promise.resolve()

    expect(guard.isAsking.value).toBe(true)
    expect(answered).not.toHaveBeenCalled()

    guard.decide('discard')

    await expect(decision).resolves.toBe(true)
    expect(guard.isAsking.value).toBe(false)
    expect(answered).toHaveBeenCalledWith(true)
  })

  test('should keep the page when the visitor stays', async () => {
    const guard = useUnsavedChangesGuard({ hasChanges: () => true })

    const decision = guard.confirm()

    guard.decide('stay')

    await expect(decision).resolves.toBe(false)
  })

  test('should save before letting go, and only let go once it worked', async () => {
    const save = vi.fn().mockResolvedValue(true)
    const guard = useUnsavedChangesGuard({ hasChanges: () => true, save })

    const decision = guard.confirm()

    guard.decide('save')

    await expect(decision).resolves.toBe(true)
    expect(save).toHaveBeenCalledOnce()
  })

  test('should stay put when the save fails', async () => {
    const guard = useUnsavedChangesGuard({
      hasChanges: () => true,
      save: () => Promise.resolve(false)
    })

    const decision = guard.confirm()

    guard.decide('save')

    await expect(decision).resolves.toBe(false)
  })

  test('should only take the first answer, so a modal may close itself', async () => {
    const guard = useUnsavedChangesGuard({ hasChanges: () => true })

    const decision = guard.confirm()

    guard.decide('discard')
    // What a modal emits on its way out, having already reported the choice.
    guard.decide('stay')

    await expect(decision).resolves.toBe(true)
  })

  test('should offer saving only where the page can save', () => {
    expect(
      useUnsavedChangesGuard({ hasChanges: () => true }).canSave.value
    ).toBe(false)

    expect(
      useUnsavedChangesGuard({
        hasChanges: () => true,
        save: () => Promise.resolve(true)
      }).canSave.value
    ).toBe(true)

    expect(
      useUnsavedChangesGuard({
        hasChanges: () => true,
        canSave: () => false,
        save: () => Promise.resolve(true)
      }).canSave.value
    ).toBe(false)
  })

  test('should put the same question to a navigation away from the page', async () => {
    const guard = useUnsavedChangesGuard({ hasChanges: () => true })

    const navigation = onRouteLeave!()
    await Promise.resolve()

    expect(guard.isAsking.value).toBe(true)

    guard.decide('stay')

    await expect(navigation).resolves.toBe(false)
  })

  test('should leave the browser to warn about leaving the app itself', () => {
    let isDirty = false

    useUnsavedChangesGuard({ hasChanges: () => isDirty })

    const whenClean = unloadEvent()
    onBeforeUnload!(whenClean)
    expect(whenClean.preventDefault).not.toHaveBeenCalled()

    isDirty = true

    const whenDirty = unloadEvent()
    onBeforeUnload!(whenDirty)
    expect(whenDirty.preventDefault).toHaveBeenCalledOnce()
  })
})
