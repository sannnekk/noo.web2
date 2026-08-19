import { uid } from '@/core/utils/id.utils'
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type {
  AssignedWorkEntity,
  TaskCheckResult
} from '../api/assigned-work.types'
import type { PossiblyUnsavedAnswer } from '../types'

export interface UseAnswerDraftsReturn {
  /** The answers being written, keyed by the task each belongs to. */
  answers: Ref<Record<string, PossiblyUnsavedAnswer>>
  /** Answers the user has touched since they were last stored. */
  changed: ComputedRef<PossiblyUnsavedAnswer[]>
  hasChanges: ComputedRef<boolean>
  /** Whether every task of the work has been answered. Untouched drafts do not count. */
  allTasksAreAnswered: ComputedRef<boolean>
  /**
   * The running sum of what the work's tasks have been given, or null while
   * none of them has a score.
   */
  scoreGiven: ComputedRef<number | null>
  update: (taskId: string, patch: Partial<PossiblyUnsavedAnswer>) => void
  /**
   * Seeds the drafts from the loaded work: what was stored, plus a blank draft
   * for every task still unanswered.
   */
  seed: () => void
  /** Marks the given answers stored, under the ids the server gave them. */
  markSaved: (answerIdsByTaskId: Record<string, string>) => void
  /**
   * Records the verdict on a task checked on its own. The answer is finished from
   * then on: scored, and closed to further edits.
   */
  markChecked: (taskId: string, verdict: TaskCheckResult) => void
  reset: () => void
}

/**
 * The answers of one assigned work as they are being written — the drafts, what
 * has changed in them, and the arithmetic read off them. Knows nothing about
 * saving: the store decides when a change is worth a request.
 *
 * @param currentWork The work being worked on, or undefined before one is loaded.
 * @param onChange Called on every user edit, so the store can start its autosave clock.
 */
function useAnswerDrafts(
  currentWork: () => AssignedWorkEntity | undefined,
  onChange: () => void
): UseAnswerDraftsReturn {
  const answers = ref<Record<string, PossiblyUnsavedAnswer>>({})

  const tasks = computed<WorkTaskEntity[]>(
    () => currentWork()?.work?.tasks ?? []
  )

  const changed = computed<PossiblyUnsavedAnswer[]>(() =>
    Object.values(answers.value).filter(
      (answer) => answer._status === 'modified'
    )
  )

  const hasChanges = computed<boolean>(() => changed.value.length > 0)

  function createDraft(
    task: Pick<WorkTaskEntity, 'id' | 'maxScore'>
  ): PossiblyUnsavedAnswer {
    return {
      _entityName: 'AssignedWorkAnswer',
      _key: uid(),
      _status: 'empty',
      taskId: task.id,
      status: 'not-submitted',
      richTextContent: null,
      wordContent: null,
      mentorComment: null,
      detailedScore: null,
      score: null,
      maxScore: task.maxScore
    }
  }

  /**
   * Applies a partial update and marks the answer unsaved. All edits go through
   * here, so the dirty flag cannot fall out of step with the content.
   */
  function update(taskId: string, patch: Partial<PossiblyUnsavedAnswer>): void {
    const answer = answers.value[taskId]

    if (!answer) {
      return
    }

    Object.assign(answer, patch, { _status: 'modified' })
    onChange()
  }

  function seed(): void {
    answers.value = (currentWork()?.answers ?? []).reduce<
      Record<string, PossiblyUnsavedAnswer>
    >((acc, answer) => {
      acc[answer.taskId] = { ...answer, _key: answer.id, _status: 'saved' }

      return acc
    }, {})

    for (const task of tasks.value) {
      answers.value[task.id] ??= createDraft(task)
    }
  }

  function markSaved(answerIdsByTaskId: Record<string, string>): void {
    for (const [taskId, answerId] of Object.entries(answerIdsByTaskId)) {
      const answer = answers.value[taskId]

      if (!answer) {
        continue
      }

      answer.id = answerId
      answer._status = 'saved'
    }
  }

  function markChecked(taskId: string, verdict: TaskCheckResult): void {
    const answer = answers.value[taskId]

    if (!answer) {
      return
    }

    answer.id = verdict.answerId
    answer.score = verdict.score
    answer.status = 'checked'
    answer._status = 'saved'
  }

  // A work whose tasks have not loaded has nothing to call answered.
  const allTasksAreAnswered = computed<boolean>(
    () =>
      currentWork()?.work?.tasks?.every(
        (task) => answers.value[task.id]?._status !== 'empty'
      ) ?? false
  )

  const scoreGiven = computed<number | null>(() => {
    let total: number | null = null

    for (const task of tasks.value) {
      const score = answers.value[task.id]?.score

      if (typeof score === 'number') {
        total = (total ?? 0) + score
      }
    }

    return total
  })

  function reset(): void {
    answers.value = {}
  }

  return {
    answers,
    changed,
    hasChanges,
    allTasksAreAnswered,
    scoreGiven,
    update,
    seed,
    markSaved,
    markChecked,
    reset
  }
}

export { useAnswerDrafts }
