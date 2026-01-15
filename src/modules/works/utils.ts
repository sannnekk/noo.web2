import type { ZodValidationResult } from '@/core/validators/zod-validation.utils'
import { validateWithZod } from '@/core/validators/zod-validation.utils'
import type { WorkTaskType } from './api/work.types'
import {
  PossiblyUnsavedWorkSchema,
  PossiblyUnsavedWorkTaskSchema
} from './schemas'
import type { PossiblyUnsavedWork, PossiblyUnsavedWorkTask } from './types'

/**
 * Validates the state of a work object.
 *
 * @param work The work object to validate.
 * @return Validation result with field errors and messages.
 */
function validateWorkState(work: PossiblyUnsavedWork): ZodValidationResult {
  return validateWithZod(PossiblyUnsavedWorkSchema, work)
}

function validateWorkTaskState(
  task: PossiblyUnsavedWorkTask
): ZodValidationResult {
  return validateWithZod(PossiblyUnsavedWorkTaskSchema, task)
}

function canBeAutomaticallyChecked(taskType?: WorkTaskType): boolean {
  return taskType === 'word'
}

export { canBeAutomaticallyChecked, validateWorkState, validateWorkTaskState }
