import { Mark, mergeAttributes } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * One kind of comment a document accepts. The editor knows nothing about the
 * vocabulary it is given: whoever renders a commentable block brings its own
 * list, so mentor mistake categories and, later, anything else can share the
 * same machinery.
 */
export interface RichtextCommentType {
  key: string
  label: string
  /** Any CSS colour, including a `var(--token)` reference. */
  color: string
}

/** A comment attached to a range of text or to a rectangle inside an image. */
export interface RichtextComment {
  id: string
  /** Key of one of the offered {@link RichtextCommentType}s. */
  type: string
  /** Plain text; line breaks are preserved as-is. */
  content: string
}

export interface CommentOptions {
  types: RichtextCommentType[]
  HTMLAttributes: Record<string, unknown>
}

/** A comment mark together with the document range it covers. */
export interface CommentRange extends RichtextComment {
  from: number
  to: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /** Attach a comment to the current selection. */
      setComment: (comment: RichtextComment) => ReturnType
      /** Rewrite the type and content of an existing comment. */
      updateComment: (
        id: string,
        comment: Omit<RichtextComment, 'id'>
      ) => ReturnType
      /** Detach a comment from every range it covers. */
      unsetComment: (id: string) => ReturnType
    }
  }
}

export const commentMarkName = 'comment'

/**
 * Inline comments, stored in the document itself rather than beside it: a mark
 * carries the whole comment, so an annotation travels with the text it is about
 * and needs no separate anchor to go stale.
 */
export const Comment = Mark.create<CommentOptions>({
  name: commentMarkName,

  // An annotation, not formatting: typing at either edge must not extend one,
  // and two comments may cover the same words.
  inclusive: false,
  excludes: '',

  addOptions() {
    return {
      types: [],
      HTMLAttributes: {}
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) =>
          attributes.id ? { 'data-comment-id': attributes.id } : {}
      },
      type: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-type'),
        renderHTML: (attributes) =>
          attributes.type ? { 'data-comment-type': attributes.type } : {}
      },
      content: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-comment-content'),
        renderHTML: (attributes) =>
          attributes.content
            ? { 'data-comment-content': attributes.content }
            : {}
      }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },

  renderHTML({ mark, HTMLAttributes }) {
    // The colour belongs to the type registry rather than to the stored
    // comment, so it is looked up here and handed to CSS as a custom property.
    const color = this.options.types.find(
      (type) => type.key === mark.attrs.type
    )?.color

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'noo-richtext-comment',
        style: color ? `--noo-richtext-comment-color: ${color}` : null
      }),
      0
    ]
  },

  addCommands() {
    return {
      setComment:
        (comment) =>
        ({ commands }) =>
          // No `.focus()`: focusing a non-editable view collapses the very
          // selection the comment is meant to cover.
          commands.setMark(this.name, comment),

      updateComment:
        (id, comment) =>
        ({ tr, state, dispatch }) => {
          const ranges = findCommentRanges(state.doc, id)

          if (!ranges.length) {
            return false
          }

          if (dispatch) {
            const markType = state.schema.marks[this.name]

            for (const range of ranges) {
              tr.removeMark(range.from, range.to, markType)
              tr.addMark(
                range.from,
                range.to,
                markType.create({ id, ...comment })
              )
            }
          }

          return true
        },

      unsetComment:
        (id) =>
        ({ tr, state, dispatch }) => {
          const ranges = findCommentRanges(state.doc, id)

          if (!ranges.length) {
            return false
          }

          if (dispatch) {
            const markType = state.schema.marks[this.name]

            for (const range of ranges) {
              tr.removeMark(range.from, range.to, markType)
            }
          }

          return true
        }
    }
  }
})

/**
 * Every range the comment covers. A single comment is usually one range, but an
 * intersecting mark (a bold word inside it, say) splits the text into several
 * nodes that each carry their own copy of the mark.
 */
export function findCommentRanges(
  doc: ProseMirrorNode,
  id: string
): CommentRange[] {
  const ranges: CommentRange[] = []

  doc.descendants((node, pos) => {
    const mark = node.marks.find(
      (candidate) =>
        candidate.type.name === commentMarkName && candidate.attrs.id === id
    )

    if (mark) {
      ranges.push({
        id,
        type: mark.attrs.type,
        content: mark.attrs.content ?? '',
        from: pos,
        to: pos + node.nodeSize
      })
    }
  })

  return ranges
}

/** The comment itself, without the ranges — `null` if the id is not in the doc. */
export function findComment(
  doc: ProseMirrorNode,
  id: string
): RichtextComment | null {
  const [range] = findCommentRanges(doc, id)

  if (!range) {
    return null
  }

  return { id: range.id, type: range.type, content: range.content }
}
