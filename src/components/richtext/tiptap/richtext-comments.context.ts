import type { InjectionKey, Ref } from 'vue'
import type { RichtextComment, RichtextCommentType } from './extensions/comment'

/** Viewport coordinates a popover hangs from. */
export interface CommentAnchor {
  top: number
  left: number
}

/**
 * What the editor's popover is showing, and how to write it back. A comment on
 * text is a mark and a comment on an image is a node attribute, so whoever
 * opens the popover brings the operations it needs — the popover itself never
 * learns which of the two it is looking at.
 */
export interface RichtextCommentTarget {
  comment: RichtextComment
  anchor: CommentAnchor
  /** Written or drawn but never saved: abandoning it has to undo it. */
  isDraft: boolean
  /** The node view that opened it, so only that one previews it. */
  owner?: symbol
  save: (comment: Omit<RichtextComment, 'id'>) => void
  remove: () => void
  /** Reflects the type as it is picked, before anything is saved. */
  retype?: (type: string) => void
}

/**
 * How a commentable editor is configured, made available to node views — which
 * tiptap mounts outside the template — through provide/inject.
 */
export interface RichtextCommentsContext {
  /** Whether new comments may be written and existing ones edited or deleted. */
  commentable: Ref<boolean>
  types: Ref<RichtextCommentType[]>
  /**
   * An editor has one popover, so it has one target. Everything that can open a
   * comment goes through here, which is what keeps a region of an image and a
   * range of text from being asked about at the same time.
   */
  target: Ref<RichtextCommentTarget | null>
  open: (target: RichtextCommentTarget) => void
}

export const richtextCommentsKey: InjectionKey<RichtextCommentsContext> =
  Symbol('richtext-comments')
