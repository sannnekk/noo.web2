import { mergeAttributes, Node } from '@tiptap/core'

export interface IframeOptions {
  /** Whether embedded frames may go fullscreen. */
  allowFullscreen: boolean
  /** Extra attributes merged onto the rendered `<iframe>`. */
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      /** Insert an embedded `<iframe>` (e.g. a video) at the current selection. */
      setIframe: (options: { src: string }) => ReturnType
    }
  }
}

/**
 * A minimal block node that embeds an external resource through an `<iframe>`.
 * Tiptap ships no generic embed node, so we provide our own instead of leaning
 * on the provider-specific extensions (e.g. Youtube).
 */
export const Iframe = Node.create<IframeOptions>({
  name: 'iframe',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'noo-richtext-iframe'
      }
    }
  },

  addAttributes() {
    return {
      src: {
        default: null
      },
      width: {
        default: '100%'
      },
      height: {
        default: null
      },
      frameborder: {
        default: 0
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen
      }
    }
  },

  parseHTML() {
    return [{ tag: 'iframe' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'noo-richtext-iframe-wrapper' },
      ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
    ]
  },

  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ tr, dispatch }) => {
          const { selection } = tr
          const node = this.type.create(options)

          if (dispatch) {
            tr.replaceRangeWith(selection.from, selection.to, node)
          }

          return true
        }
    }
  }
})
