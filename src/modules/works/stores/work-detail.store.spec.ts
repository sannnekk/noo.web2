import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() })
}))

import { useWorkDetailStore } from './work-detail.store'

/**
 * Task numbers are read by people — "Задание №3" has to be the third task. Removing
 * one from the middle used to leave the rest carrying the numbers they had, so a work
 * could end up numbered 1, 3, 7. The server settles this on save; the editor has to
 * agree with it in the meantime.
 */
describe('useWorkDetailStore — task numbering', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function newWorkWith(taskCount: number) {
    const store = useWorkDetailStore()

    store.init()

    for (let i = 0; i < taskCount; i++) {
      store.addTask()
    }

    return store
  }

  const ordersOf = (store: ReturnType<typeof useWorkDetailStore>) =>
    store.work?.tasks?.map((task) => task.order)

  test('numbers tasks from one as they are added', () => {
    const store = newWorkWith(3)

    expect(ordersOf(store)).toEqual([1, 2, 3])
  })

  test('closes the gap when a task is removed from the middle', () => {
    const store = newWorkWith(4)
    const removedKey = store.work!.tasks![1]._key
    const survivingKeys = store
      .work!.tasks!.filter((task) => task._key !== removedKey)
      .map((task) => task._key)

    store.removeTask(removedKey)

    expect(ordersOf(store)).toEqual([1, 2, 3])
    // The ones that stayed keep their sequence, they just move up a place.
    expect(store.work!.tasks!.map((task) => task._key)).toEqual(survivingKeys)
  })

  test('keeps numbering right when a task is added after a removal', () => {
    const store = newWorkWith(3)

    store.removeTask(store.work!.tasks![0]._key)
    store.addTask()

    expect(ordersOf(store)).toEqual([1, 2, 3])
  })

  test('renumbers down to nothing', () => {
    const store = newWorkWith(2)

    store.removeTask(store.work!.tasks![0]._key)
    store.removeTask(store.work!.tasks![0]._key)

    expect(ordersOf(store)).toEqual([])
  })

  /**
   * Dragging in the grid rearranges the array itself; `reorderTasks` is what turns
   * that new sequence into the numbers that get saved. Nothing else carries it —
   * the patch document keys tasks by id, so a task that only moved says nothing.
   */
  test('takes its numbering from the sequence the tasks now sit in', () => {
    const store = newWorkWith(3)
    const [first, second, third] = store.work!.tasks!.map((task) => task._key)

    // What a drag of the last task to the front leaves behind.
    store.work!.tasks!.reverse()
    store.reorderTasks()

    expect(store.work!.tasks!.map((task) => task._key)).toEqual([
      third,
      second,
      first
    ])
    expect(ordersOf(store)).toEqual([1, 2, 3])
  })

  test('gives a moved task the number of the place it landed in', () => {
    const store = newWorkWith(3)
    const moved = store.work!.tasks![2]

    store.work!.tasks!.splice(2, 1)
    store.work!.tasks!.splice(0, 0, moved)
    store.reorderTasks()

    expect(moved.order).toBe(1)
    expect(ordersOf(store)).toEqual([1, 2, 3])
  })
})
