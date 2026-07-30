import { uid } from '@/core/utils/id.utils'
import type { PollEntity, PossiblyUnsavedPoll } from './api/poll.types'

function toPossiblyUnsaved(entity: PollEntity): PossiblyUnsavedPoll {
  return {
    ...entity,
    _key: uid(),
    questions: (entity?.questions ?? []).map((question) => ({
      ...question,
      _key: uid()
    }))
  }
}

export { toPossiblyUnsaved }
