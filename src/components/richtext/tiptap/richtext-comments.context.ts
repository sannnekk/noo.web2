import type { InjectionKey, Ref } from 'vue'
import type { RichtextCommentType } from './extensions/comment'

/**
 * How a commentable editor is configured, made available to node views — which
 * tiptap mounts outside the template — through provide/inject.
 */
export interface RichtextCommentsContext {
  /** Whether new comments may be written and existing ones edited or deleted. */
  commentable: Ref<boolean>
  types: Ref<RichtextCommentType[]>
}

export const richtextCommentsKey: InjectionKey<RichtextCommentsContext> =
  Symbol('richtext-comments')
