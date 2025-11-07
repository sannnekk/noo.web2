import { getValidationErrors } from '@/core/utils/zod.utils'
import type { WorkTaskType } from './api/work.types'
import { PossiblyUnsavedWorkSchema } from './schemas'
import type { PossiblyUnsavedWork } from './types'

/**
 * Validates the state of a work object.
 *
 * @param work The work object to validate.
 * @return An array of error messages if validation fails, or an empty array if valid.
 */
function validateWorkState(work: PossiblyUnsavedWork): string[] {
  return getValidationErrors(PossiblyUnsavedWorkSchema, work)
}

function canBeAutomaticallyChecked(taskType?: WorkTaskType): boolean {
  return taskType === 'word'
}

export { canBeAutomaticallyChecked, validateWorkState }
