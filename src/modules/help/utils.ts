import { uid } from '@/core/utils/id.utils'
import type {
  PossiblyUnsavedSupportArticle,
  SupportArticleEntity
} from './api/support.types'

function toPossiblyUnsaved(
  entity: SupportArticleEntity
): PossiblyUnsavedSupportArticle {
  return {
    ...entity,
    _key: uid()
  }
}

export { toPossiblyUnsaved }
